<?php

use App\Jobs\InitializeCatalogSync;
use App\Jobs\SyncCatalogSchool;
use App\Models\ActivityLog;
use App\Models\CatalogSyncRun;
use App\Models\ProgramCatalog;
use App\Models\User;
use App\Services\CatalogSyncService;
use App\Services\PortalService;
use App\Services\ProgramPresenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.portal.key' => 'test-key', 'services.portal.base_url' => 'https://portal.test',
        'services.portal.permit_base_url' => 'https://portal.test/files']);
    Http::preventStrayRequests();
    Cache::flush();
});

test('browsing caches ten minutes while forced refresh updates derived names and majors', function () {
    Http::fake(['*/fetch-programs' => Http::sequence()
        ->push([['programName' => 'Old', 'majorName' => 'Old major']])
        ->push([['programName' => 'New', 'majorName' => 'New major']])]);
    $portal = app(PortalService::class);
    $first = $portal->programSnapshot('12001');
    $this->travel(5)->minutes();
    expect($portal->programSnapshot('12001'))->toBe($first);
    Http::assertSentCount(1);
    $fresh = $portal->programSnapshot('12001', true);
    expect($fresh['last_fetched_at'])->not->toBe($first['last_fetched_at']);
    expect($portal->fetchPrograms('12001'))->toBe(['New']);
    expect($portal->fetchMajors('12001', 'New'))->toBe(['New major']);
    Http::assertSentCount(2);
});

test('bad responses preserve the last successful snapshot and its time', function ($body, $status) {
    Http::fake(['*/fetch-programs' => Http::sequence()->push([['programName' => 'Preserved']])
        ->push($body, $status)->push($body, $status)]);
    $portal = app(PortalService::class);
    $first = $portal->programSnapshot('12001');
    $this->travel(11)->minutes();
    $failed = $portal->programSnapshot('12001', true);
    expect($failed['stale'])->toBeTrue()->and($failed['error'])->not->toBeNull()
        ->and($failed['data'])->toBe($first['data'])
        ->and($failed['last_fetched_at'])->toBe($first['last_fetched_at']);
})->with([
    'unauthorized' => [['message' => 'Unauthorized'], 401],
    'server error' => [['message' => 'Unavailable'], 503],
    'object envelope' => [['data' => []], 200],
    'empty object' => ['{}', 200],
    'missing name' => [[['majorName' => 'Invalid']], 200],
    'wrong field type' => [[['programName' => 'Name', 'filename' => []]], 200],
]);

test('connection failures preserve data for seven days but not indefinitely', function () {
    $offline = false;
    Http::fake(function () use (&$offline) {
        return $offline ? Http::failedConnection() : Http::response([['programName' => 'Saved']]);
    });
    $portal = app(PortalService::class);
    $portal->programSnapshot('12001');
    $offline = true;
    $this->travel(6)->days();
    expect($portal->programSnapshot('12001')['data'])->toHaveCount(1);
    $this->travel(2)->days();
    $unavailable = $portal->programSnapshot('12001');
    expect($unavailable['data'])->toBe([])->and($unavailable['last_fetched_at'])->toBeNull()
        ->and($unavailable['error'])->not->toBeNull();
});

test('valid empty lists replace prior data and are successful', function () {
    Http::fake(['*/fetch-programs' => Http::sequence()->push([['programName' => 'Old']])->push([])]);
    $portal = app(PortalService::class);
    $portal->programSnapshot('12001');
    $empty = $portal->programSnapshot('12001', true);
    expect($empty['data'])->toBe([])->and($empty['stale'])->toBeFalse()->and($empty['error'])->toBeNull();
});

test('overlapping refreshes do not call the portal', function () {
    $lock = Cache::lock('portal:v2:programs:'.hash('sha256', '12001').':refresh', 60);
    $lock->get();
    expect(app(PortalService::class)->programSnapshot('12001', true)['error'])->toContain('already in progress');
    Http::assertNothingSent();
    $lock->release();
});

test('school failures preserve the successful school list', function () {
    Http::fake(['*/fetch-all-hei' => Http::sequence()->push([['instCode' => '12001', 'instName' => 'School']])
        ->push(['error' => 'bad response'])]);
    $portal = app(PortalService::class);
    $first = $portal->schoolSnapshot();
    $failed = $portal->schoolSnapshot(true);
    expect($failed['data'])->toBe($first['data'])->and($failed['stale'])->toBeTrue();
});

test('presenter normalizes classifications and gives documents precedence', function () {
    ProgramCatalog::create(['program_name' => 'BS IT', 'normalized_name' => 'BS IT', 'program_type' => 'Board']);
    $rows = app(ProgramPresenter::class)->map([
        ['programName' => ' bs   it ', 'filename' => 'doc.pdf'],
        ['programName' => 'Number', 'permit_4thyr' => 'GR-1'],
        ['programName' => 'Missing'],
    ], '12001', null);
    expect($rows[0]['program_type'])->toBe('Board')->and($rows[0]['permit_number'])->toBeNull()
        ->and(array_column($rows, 'badge_priority'))->toBe([1, 2, 3]);
});

test('viewer can browse and refresh but cannot classify or sync', function () {
    Queue::fake();
    Http::fake(['*/fetch-all-hei' => Http::response([['instCode' => '12001', 'instName' => 'School']]),
        '*/fetch-programs' => Http::response([['programName' => 'BS IT']])]);
    $catalog = ProgramCatalog::create(['program_name' => 'BS IT', 'normalized_name' => 'BS IT', 'program_type' => 'Unknown']);
    $run = CatalogSyncRun::create(['status' => 'completed']);
    $this->actingAs(User::factory()->create(['role' => 'prc', 'is_active' => true]));
    $this->get('/programs')->assertOk();
    $this->get('/programs/catalog')->assertOk();
    $this->postJson('/programs/refresh', ['instCode' => '12001'])->assertOk()->assertJsonPath('programs.0.program_name', 'BS IT');
    $this->postJson('/programs/refresh', ['instCode' => '../invalid'])->assertUnprocessable();
    $this->postJson('/programs/refresh', ['instCode' => '99999'])->assertUnprocessable();
    $this->patchJson('/programs/catalog/'.$catalog->id, ['program_type' => 'Board'])->assertForbidden();
    $this->postJson('/programs/catalog/sync')->assertForbidden();
    $this->getJson('/programs/catalog/sync/'.$run->id)->assertForbidden();
    Queue::assertNothingPushed();
});

test('guests cannot refresh and the public global clear route is removed', function () {
    $this->postJson('/programs/refresh', ['instCode' => '12001'])->assertUnauthorized();
    $this->postJson('/programs/catalog/sync')->assertUnauthorized();
    $this->post('/artisan/optimize-clear')->assertNotFound();
});

test('classification edits persist all three states with actor and before after audit', function () {
    $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    $catalog = ProgramCatalog::create(['program_name' => 'BS IT', 'normalized_name' => 'BS IT', 'program_type' => 'Unknown']);
    $this->actingAs($admin);
    foreach (['Board', 'Non-Board', 'Unknown'] as $type) {
        $this->patchJson('/programs/catalog/'.$catalog->id, ['program_type' => $type])->assertOk();
        expect($catalog->fresh()->program_type)->toBe($type);
    }
    expect(ActivityLog::where('user_id', $admin->id)->where('action', 'program_catalog_update')->count())->toBe(3);
    expect(ActivityLog::latest('id')->first()->properties)->toBe(['before' => 'Non-Board', 'after' => 'Unknown']);
    $this->patchJson('/programs/catalog/'.$catalog->id, ['program_type' => 'Invalid'])->assertUnprocessable();
    expect($catalog->fresh()->program_type)->toBe('Unknown');
});

test('catalog counts respect search before classification and pages clamp', function () {
    foreach (['Board', 'Non-Board', 'Unknown'] as $type) {
        ProgramCatalog::create(['program_name' => 'Science '.$type, 'normalized_name' => 'SCIENCE '.$type, 'program_type' => $type]);
    }
    ProgramCatalog::create(['program_name' => 'Arts', 'normalized_name' => 'ARTS', 'program_type' => 'Unknown']);
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->get('/programs/catalog?q=Science&type=Board&page=99&per_page=10')->assertInertia(fn (Assert $page) => $page
        ->component('programs/catalog')->where('counts.all', 3)->where('counts.Unknown', 1)
        ->where('programs.total', 1)->where('programs.current_page', 1)->has('programs.data', 1));
});

test('duplicate starts return one run and explicitly dispatch to database', function () {
    Queue::fake();
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $first = $this->postJson('/programs/catalog/sync')->assertAccepted()->assertJsonPath('status', 'queued')->json('id');
    $this->postJson('/programs/catalog/sync')->assertAccepted()->assertJsonPath('id', $first);
    expect(CatalogSyncRun::count())->toBe(1);
    Queue::assertPushed(InitializeCatalogSync::class, fn ($job) => $job->connection === 'database');
    Queue::assertPushed(InitializeCatalogSync::class, 1);
});

test('sync bypasses caches preserves classification and retries only failed schools idempotently', function () {
    Queue::fake();
    $failing = true;
    Http::fake(function ($request) use (&$failing) {
        if (str_ends_with($request->url(), 'fetch-all-hei')) {
            return Http::response([['instCode' => '1', 'instName' => 'One'], ['instCode' => '2', 'instName' => 'Two']]);
        }
        if ($request['instCode'] === '2' && $failing) {
            return Http::response(['message' => 'Unavailable'], 503);
        }

        return Http::response([['programName' => ' bs   it '], ['programName' => 'New Program']]);
    });
    ProgramCatalog::create(['program_name' => 'BS IT', 'normalized_name' => 'BS IT', 'program_type' => 'Board']);
    Cache::put('portal:v2:programs:'.hash('sha256', '1'), ['data' => [], 'last_fetched_at' => now()->toIso8601String()], 600);
    $sync = app(CatalogSyncService::class);
    $portal = app(PortalService::class);
    $run = $sync->start(null);
    (new InitializeCatalogSync($run->id))->handle($portal, $sync);
    $schools = $run->schools()->orderBy('institution_code')->get();
    foreach ($schools as $school) {
        (new SyncCatalogSchool($school->id))->handle($portal, $sync);
    }
    expect($run->fresh()->status)->toBe('partial')->and(ProgramCatalog::count())->toBe(2)
        ->and(ProgramCatalog::where('normalized_name', 'BS IT')->value('program_type'))->toBe('Board');
    expect($sync->serialize($run->fresh()))->toMatchArray(['processed' => 2, 'created' => 1]);
    Queue::fake();
    $failing = false;
    $sync->start(null, $run);
    Queue::assertPushed(SyncCatalogSchool::class, 1);
    Queue::assertPushed(SyncCatalogSchool::class, fn ($job) => $job->schoolId === $schools[1]->id);
    $retry = new SyncCatalogSchool($schools[1]->id);
    $retry->handle($portal, $sync);
    $retry->handle($portal, $sync);
    expect($run->fresh()->status)->toBe('completed')->and($run->fresh()->active_slot)->toBeNull()
        ->and(ProgramCatalog::count())->toBe(2)->and($sync->serialize($run->fresh())['created'])->toBe(1);
});
