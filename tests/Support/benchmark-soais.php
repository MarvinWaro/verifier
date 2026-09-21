<?php

// Uses a new disposable SQLite database, never the application's configured database.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$count = (int) ($argv[1] ?? 40000);
$database = tempnam(storage_path('framework/testing'), 'benchmark-');
config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $database, 'cache.default' => 'array',
    'filesystems.disks.local.root' => storage_path('framework/testing/benchmark-files'), 'queue.default' => 'database']);
Illuminate\Support\Facades\DB::purge('sqlite');
Illuminate\Support\Facades\Artisan::call('migrate', ['--database' => 'sqlite', '--force' => true]);
Illuminate\Support\Facades\Queue::fake();
$user = App\Models\User::create(['name' => 'Benchmark', 'email' => 'benchmark@example.test', 'password' => 'unused', 'role' => 'admin', 'is_active' => true]);
$institution = App\Models\Institution::create(['institution_code' => '12001', 'name' => 'Synthetic College', 'type' => 'Private']);
App\Models\Program::create(['institution_id' => $institution->id, 'program_name' => 'BS IT', 'major' => null, 'permit_number' => 'TEST']);
$service = app(App\Services\GraduateImportService::class);
$reader = app(App\Services\SoaisReader::class);
$started = microtime(true);
$maxSeconds = 0;
$peak = 0;
$file = new Illuminate\Http\UploadedFile(storage_path("framework/testing/soais-{$count}.xlsx"), 'synthetic.xlsx', null, null, true);
$run = $service->start($file, $user->id);
$initStart = microtime(true);
memory_reset_peak_usage();
(new App\Jobs\InitializeGraduateImport($run->id))->handle($service, $reader);
$initSeconds = microtime(true) - $initStart;
$initPeak = memory_get_peak_usage(true);
foreach (['reading', 'writing'] as $phase) {
    foreach ($run->chunks()->where('phase', $phase)->orderBy('id')->get() as $i => $chunk) {
        memory_reset_peak_usage();
        $chunkStart = microtime(true);
        (new App\Jobs\ProcessGraduateChunk($chunk->id, $phase))->handle($service, $reader);
        $maxSeconds = max($maxSeconds, microtime(true) - $chunkStart);
        $peak = max($peak, memory_get_peak_usage(true));
        if ($i % 10 === 0) {
            echo $phase.' chunk '.($i + 1).' elapsed '.round(microtime(true) - $started, 1)."s\n";
        }
        gc_collect_cycles();
    }
}
$search = microtime(true);
App\Models\Graduate::where('last_name', 'like', '%Example4%')->orderBy('last_name')->paginate(25);
$result = ['rows' => App\Models\Graduate::count(), 'seconds' => round(microtime(true) - $started, 2),
    'initialization_seconds' => round($initSeconds, 2), 'initialization_php_mb' => round($initPeak / 1048576, 2),
    'max_chunk_seconds' => round($maxSeconds, 2), 'peak_php_mb' => round($peak / 1048576, 2), 'search_ms' => round((microtime(true) - $search) * 1000, 2),
    'status' => $run->fresh()->status, 'counts' => $service->serialize($run->fresh())['counts'], 'database' => 'isolated SQLite'];
echo json_encode($result, JSON_PRETTY_PRINT).PHP_EOL;
file_put_contents(storage_path("framework/testing/benchmark-{$count}.json"), json_encode($result, JSON_PRETTY_PRINT));
if ($result['rows'] !== $count || max($initSeconds, $maxSeconds) >= 45 || max($initPeak, $peak) >= 256 * 1048576 || $result['status'] !== 'completed') {
    exit(1);
}
