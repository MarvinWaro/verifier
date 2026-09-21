import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync('storage/framework/testing', { recursive: true });
const directory = mkdtempSync(resolve('storage/framework/testing/programs-'));
const database = resolve(directory, 'browser.sqlite');
writeFileSync(database, '');
const env = {
    ...process.env,
    APP_ENV: 'testing',
    APP_URL: 'http://127.0.0.1:8017',
    APP_DEBUG: 'true',
    APP_CONFIG_CACHE: resolve(directory, 'config.php'),
    DB_CONNECTION: 'sqlite',
    DB_DATABASE: database,
    CACHE_STORE: 'database',
    SESSION_DRIVER: 'file',
    SESSION_COOKIE: 'programs_browser_test',
    QUEUE_CONNECTION: 'database',
    PORTAL_API: 'browser-fixture',
    PORTAL_BASE_URL: 'http://127.0.0.1:9',
    PORTAL_PERMIT_BASE_URL: 'http://127.0.0.1:8017/fixture-pdf',
    INERTIA_SSR_ENABLED: 'false',
};
const phpFlags =
    process.platform === 'win32' ? ['-d', 'extension=pdo_sqlite'] : [];
for (const args of [
    ['artisan', 'migrate', '--force'],
    ['tests/browser/seed.php'],
]) {
    const result = spawnSync('php', [...phpFlags, ...args], {
        env,
        stdio: 'inherit',
        windowsHide: true,
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
const server = spawn(
    'php',
    [
        ...phpFlags,
        '-S',
        '127.0.0.1:8017',
        '-t',
        'public',
        'tests/browser/router.php',
    ],
    { env, stdio: 'inherit', windowsHide: true },
);
process.on('SIGTERM', () => {
    server.kill();
    process.exit();
});
process.on('SIGINT', () => {
    server.kill();
    process.exit();
});
server.on('exit', (code) => process.exit(code ?? 0));
