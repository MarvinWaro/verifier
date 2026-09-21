<?php

use App\Models\Graduate;
use App\Models\User;
use App\Services\DashboardAnalytics;
use App\Services\GraduateData;
use App\Services\PortalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function dashboardGraduate(array $overrides = []): Graduate
{
    static $sequence = 0;

    return Graduate::create(array_merge([
        'hei_uii' => '12001', 'so_number' => 'TEST-'.++$sequence,
        'last_name' => 'Example', 'first_name' => 'Student', 'sex' => 'MALE',
        'date_graduated' => '2024-06-01', 'course_from_excel' => 'Computer Science',
    ], $overrides));
}

test('dashboard aggregates normalized programs filters dates and missing sex', function () {
    dashboardGraduate();
    dashboardGraduate(['course_from_excel' => ' COMPUTER   SCIENCE ', 'sex' => 'FEMALE']);
    dashboardGraduate(['hei_uii' => '12002', 'date_graduated' => '2025-01-01', 'sex' => null]);
    dashboardGraduate(['date_graduated' => '', 'course_from_excel' => '', 'sex' => null]);
    $service = app(DashboardAnalytics::class);
    $all = $service->summarize(null, null, [['instCode' => '12001', 'instName' => 'Example College']]);
    expect($all['stats'])->toBe(['graduates' => 4, 'institutions' => 2, 'programs' => 1])
        ->and($all['chartData']['undated'])->toBe(1)
        ->and($all['chartData']['topPrograms'][0]['count'])->toBe(3)
        ->and($all['chartData']['sex'][2]['count'])->toBe(2)
        ->and($all['chartData']['topInstitutions'][1]['label'])->toBe('HEI 12002');
    $filtered = $service->summarize(2024, '12001', []);
    expect($filtered['stats']['graduates'])->toBe(2)
        ->and($filtered['chartData']['trend'])->toHaveCount(12)
        ->and($filtered['chartData']['trend'][5])->toBe(['label' => 'Jun', 'count' => 2]);
    $empty = $service->summarize(2025, '12001', []);
    expect($empty['stats']['graduates'])->toBe(0)->and($empty['hasRecords'])->toBeTrue();
});

test('dashboard validates filters and keeps analytics during a portal outage', function () {
    dashboardGraduate();
    $this->mock(PortalService::class)->shouldReceive('schoolSnapshot')->andReturn([
        'data' => [], 'last_fetched_at' => null, 'stale' => true, 'error' => 'Unavailable',
    ]);
    $this->get('/dashboard')->assertRedirect('/login');
    $user = User::factory()->create();
    $this->actingAs($user)->get('/dashboard?year=2024&institution=12001')
        ->assertOk()->assertInertia(fn (Assert $page) => $page->component('dashboard')
        ->where('stats.graduates', 1)->where('portal.count', null)->where('portal.stale', true)
        ->where('filters.year', 2024)->where('chartData.topInstitutions.0.label', 'HEI 12001'));
    $this->getJson('/dashboard?year=bad')->assertUnprocessable();
    $this->getJson('/dashboard?institution=missing')->assertUnprocessable();
});

test('dashboard distinguishes no records and a valid empty portal directory', function () {
    $this->mock(PortalService::class)->shouldReceive('schoolSnapshot')->andReturn([
        'data' => [], 'last_fetched_at' => now()->toIso8601String(), 'stale' => false, 'error' => null,
    ]);
    $this->actingAs(User::factory()->create())->get('/dashboard')->assertInertia(
        fn (Assert $page) => $page->where('hasRecords', false)->where('portal.count', 0)->where('stats.graduates', 0)
    );
});

test('dashboard handles legacy date strings and stale directory names', function () {
    dashboardGraduate(['date_graduated' => 'June 2, 2024']);
    dashboardGraduate(['date_graduated' => 'unknown 2024']);
    $result = app(DashboardAnalytics::class)->summarize(2024, null, []);
    expect($result['chartData']['trend'][5]['count'])->toBe(1)->and($result['chartData']['undated'])->toBe(1);
});

test('dashboard summarizes eighty thousand records without returning student rows', function () {
    $base = ['hei_uii' => '12001', 'last_name' => 'Synthetic', 'first_name' => 'Student',
        'course_from_excel' => 'Science', 'date_graduated' => '2024-06-01', 'sex' => 'FEMALE'];
    $base += GraduateData::indexes($base);
    for ($batch = 0; $batch < 160; $batch++) {
        $rows = [];
        for ($i = 0; $i < 500; $i++) {
            $rows[] = $base + ['so_number' => 'BENCH-'.($batch * 500 + $i)];
        }
        DB::table('graduates')->insert($rows);
    }
    $start = microtime(true);
    $result = app(DashboardAnalytics::class)->summarize(2024, '12001', []);
    $seconds = microtime(true) - $start;
    expect($result['stats']['graduates'])->toBe(80000)
        ->and($result['chartData']['trend'][5]['count'])->toBe(80000)
        ->and(strlen(json_encode($result)))->toBeLessThan(5000);
    fwrite(STDERR, sprintf("\nDashboard 80k aggregate: %.3fs; PHP peak %.1f MiB\n", $seconds, memory_get_peak_usage(true) / 1048576));
});
