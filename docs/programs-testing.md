# Programs and catalog acceptance guide

Run `php artisan migrate` (additive only), then `composer run dev`. Catalog jobs use the database `default` queue. Student jobs use `imports`; both are included in development startup and the shared-hosting command `php artisan app:work-queues`. See [student import deployment](students-import-testing.md) for cron setup and hosting requirements.

1. Open Programs, select a school, and verify the school name, program count and last successful fetch time.
2. Search by program, major or permit number; combine classification/status/permit filters. Check ten-row pagination, result counts and empty search results.
3. Open permits with documents, numbers only, and neither. A document without a number remains green. Check narrow screens, keyboard access and dark mode.
4. Click Refresh from portal. Selection and filters remain; success appears only after fresh results. On an API failure, prior results and their original timestamp remain with a warning. A successful empty response is distinct from failure.
5. Keep Programs visible/online for five minutes and verify automatic refresh. Hide/disconnect and verify requests pause. Switch schools during a delayed response and ensure old rows cannot replace the new selection.
6. In Catalog, set Unclassified, Board and Non-Board; verify persistence, filtered counts, page size and activity history. Existing classifications survive synchronization.
7. Start catalog sync, reload, and inspect progress. Repeated starts return the active run. With fake per-school failures, verify partial status and retry only failed schools without duplicates.
8. Test a viewer: browsing/refresh allowed, classification edits and sync denied without `update_program_catalog`, including direct endpoint requests.
9. Verify Institutions and public lookup still work and the public application-wide cache-clear action is gone.

Automated checks:

```powershell
php -d extension=pdo_sqlite vendor/bin/pest tests/Feature/ProgramsModuleTest.php
npx vitest run
npm run build
npx playwright test tests/browser/programs.spec.ts
```

Omit the SQLite extension flag if already enabled. Tests use fake portal data and isolated databases; no live portal modifications are required. Last fetched means receipt by this application, not the portal's record modification time.
