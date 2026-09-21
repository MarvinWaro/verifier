<?php

// Isolated browser-test entrypoint; never deployed as an application route.
if (getenv('APP_ENV') !== 'testing' || getenv('DB_CONNECTION') !== 'sqlite') {
    http_response_code(403);
    exit;
}
$path = realpath(__DIR__.'/../../public'.parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($path && str_starts_with($path, realpath(__DIR__.'/../../public').DIRECTORY_SEPARATOR) && is_file($path)) {
    return false;
}
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();
$app->make(Illuminate\Foundation\Vite::class)->useHotFile(storage_path('framework/testing/no-hot'));
$app->handleRequest(Illuminate\Http\Request::capture());
