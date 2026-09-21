<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (! app()->environment('testing') || config('database.default') !== 'sqlite') {
    throw new RuntimeException('Browser fixtures require an isolated SQLite test database.');
}
App\Models\User::create(['name' => 'Browser Admin', 'email' => 'browser@example.test',
    'password' => 'browser-test-password', 'role' => 'admin', 'is_active' => true]);
$schools = [['instCode' => '12001', 'instName' => 'Example State College', 'ownershipSector' => 'PUBLIC']];
$records = [];
foreach (range(1, 23) as $id) {
    $name = sprintf('Science Program %02d', $id);
    $records[] = ['programName' => $name, 'majorName' => 'Computing', 'program_status' => 'Active',
        'permit_4thyr' => $id === 1 || $id % 3 === 0 ? null : 'GR-'.$id, 'filename' => $id % 3 === 1 ? 'sample.pdf' : null];
    App\Models\ProgramCatalog::create(['program_name' => $name, 'normalized_name' => strtoupper($name), 'program_type' => 'Unknown']);
}
foreach (['schools' => $schools, 'programs:'.hash('sha256', '12001') => $records] as $key => $data) {
    $snapshot = ['data' => $data, 'last_fetched_at' => now()->toIso8601String()];
    Illuminate\Support\Facades\Cache::put('portal:v2:'.$key, $snapshot, 3600);
    Illuminate\Support\Facades\Cache::put('portal:v2:'.$key.':last_success', $snapshot, 3600);
}
require_once __DIR__.'/../Support/SoaisFixture.php';
$sample = Tests\Support\SoaisFixture::row();
$sample[10] = 'Science Program 01';
$sample[12] = 'Computing';
Tests\Support\SoaisFixture::make(storage_path('framework/testing/browser-students.xlsx'), [$sample]);
file_put_contents(storage_path('framework/testing/browser-database.txt'), config('database.connections.sqlite.database'));
