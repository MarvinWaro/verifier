# SOAIS student imports: setup and acceptance testing

## What changed

### Simple upload flow (latest update)

Choose a file and click **Upload Excel**. The visible, online import page automatically sends authenticated processing requests; no terminal worker is required while it remains open. Each request consumes up to 20 existing database jobs, stopping between jobs after eight seconds. Initialization still performs one streaming workbook pass and may take longer than eight seconds. PHP's request time budget is 45 seconds; hosting/proxy limits can be lower and must be verified. This deliberately replaces the earlier worker-only UX with browser-assisted batches, not one web request for the entire workbook.

Closing/hiding the page stops new browser batches. Reopening the Graduates import tab resumes the active import. The optional scheduled worker continues processing without an open browser; both paths use the same database reservations, job locks and transactions. Existing duplicate handling, changed-record updates and retry semantics remain unchanged.

“Imported · review notes” means students were retained with information to review, such as a missing local program link. “Imported · review skipped rows” means some rows were rejected. **View review notes** opens a paginated drawer showing Excel row numbers and explanations; CSV export remains optional inside the drawer.

Uploads are stored on Laravel's private `local` disk. The upload response is HTTP 202 with an import ID; database queue jobs validate and stage rows, then save in 500-row transactions. A second upload or clearing graduates is blocked while an import is active. Navigation does not cancel processing.

Identity is normalized HEI UII + SO number. Reuploads update Excel fields, preserve birth dates/student IDs, and retain students missing from the new file. Conflicting duplicates within a workbook are reported without choosing an arbitrary winner. Identical duplicate rows are skipped. Existing database identity conflicts stop the additive migration and report IDs for review; records are never automatically deleted.

Program linking requires exactly one match for institution, normalized program name, and major. An unmatched/ambiguous program creates a warning and retains the Excel information. It does not discard the student. Portal-backed Institution dialogs can still find these students by HEI, program and major.

Supported input: an SOAIS worksheet with headers in rows 2–3 and data beginning in row 4, maximum upload 32 MB. The current official multi-tab workbook is supported: the importer selects the single tab named `SO Masterlist` and ignores Instructions/Regions/Academic Year/HEIs/Programs/Majors reference tabs. A multi-tab workbook without one clearly named SO Masterlist fails safely. Imported columns: D–M, P and R, including PSCED. Empty template rows with numbering/region only are skipped. Dates support Excel serials and explicit YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY, and English month-name formats. Save formula values in Excel before uploading; the importer does not calculate formulas.

XLSX preparation streams worksheet XML and shared strings to private 500-row parts. Filtered PhpSpreadsheet alone used excessive native XML memory on large workbooks during testing. Legacy XLS retains the filtered PhpSpreadsheet reader. XLSX expanded size is capped at 512 MB and 250,000 worksheet data rows. Legacy XLS capacity has not been load-tested; use XLSX for large masterlists.

Completed sources, prepared parts and staged rows are pruned after 30 days by the scheduled worker. Failed/unfinished imports remain recoverable. History, row issues and audit summaries remain. Private import storage must not be exposed through the web document root.

## Local startup

1. Back up the database and install dependencies with `composer install` and `npm ci`.
2. Run `php artisan migrate`. Only additive import/catalog migrations are needed. Never use `migrate:fresh` against existing data.
3. Use `QUEUE_CONNECTION=database`, `CACHE_STORE=database`, and `DB_QUEUE_RETRY_AFTER=90`. Leave `DB_QUEUE_CONNECTION` unset so job dispatch and student progress use the same database transaction.
4. Start `composer run dev`. Its queue listener includes both `default` (catalog) and `imports` queues. If web/Vite are already running, browser-assisted imports work without another command. For optional unattended processing, run:

   ```powershell
   php artisan queue:work database --queue=default,imports --timeout=45 --tries=1
   ```

5. For one bounded scheduled-worker run:

   ```powershell
   php artisan app:work-queues
   ```

6. Reload Settings → Import → Graduates, select the workbook, and click **Upload Excel**. Selecting a file enables the button. An active import disables new uploads and resumes automatically on this page. History-loading failures do not disable an otherwise valid upload.

Local `C:\php\php.ini` was backed up to `C:\php\php.ini.students-20260918-143651.bak` and changed to `upload_max_filesize=32M`, `post_max_size=40M`, `memory_limit=256M`. Restart already-running PHP web/worker processes to pick up these settings. Windows workers lack POSIX signal timeouts, so Linux timeout behavior still needs hosting verification.

## GoDaddy cPanel deployment

No authenticated hosting connection was available; these are deployment instructions, not a claim that hosted settings were changed.

1. Back up the hosted database. Deploy code/dependencies and built `public/build` assets. Set the document root to Laravel `public`, with writable private storage and `bootstrap/cache`.
2. Check the actual PHP executable/version and extensions (`php -v`, `php --ini`, `php -m`). Required spreadsheet extensions include zip, XMLReader, SimpleXML and mbstring; verify the database PDO driver and CLI pcntl for job timeouts.
3. Set web PHP limits to 32M upload, 40M post, 256M memory through the hosting PHP configuration. Verify effective **web and CLI** values separately. Confirm request-body limits, disk quota, CPU/process runtime limits and permitted cron frequency with the hosting account. Do not publish a public phpinfo page.
4. Set the queue/cache environment values above, run `php artisan migrate --force`, then `php artisan config:cache`. Keep the queue database connection the same as the application database.
5. Run the bounded worker manually once and confirm the worker timestamp advances in Import. Jobs have a 45-second timeout; the database retry interval is 90 seconds. The worker stops accepting jobs after 50 seconds, so its total duration can approach 95 seconds. An application cache lock lasts 180 seconds to prevent overlapping scheduled invocations. Hosting must permit those durations.
6. Add a cron command using the **verified** executable and absolute project path. GoDaddy documents cPanel → Advanced → Cron Jobs and a PHP command example in [Create cron jobs](https://www.godaddy.com/en-in/help/create-cron-jobs-16086). For example, after replacing account/path values:

   ```sh
   /usr/local/bin/php -d memory_limit=256M /home/ACCOUNT/verifier/artisan app:work-queues >> /home/ACCOUNT/verifier/storage/logs/scheduled-worker.log 2>&1
   ```

   Choose the shortest frequency your account permits (for example, every minute if allowed). Do not assume all plans allow the same interval. Protect and rotate worker logs. Do not add a second persistent worker on shared hosting.
7. Validate with synthetic 40k/80k workbooks on staging, including PHP/native process memory, every initialization/chunk duration, and browsing while cron is processing. Activate production imports only if all jobs fit the 45-second/256-MB budgets with headroom. Slow hosting may need smaller uploads or a separate worker host; PHP limits alone do not establish capacity.

## Acceptance steps

1. **Upload:** stop the separate CLI worker, choose the provided sample, upload, and observe separate upload and processing indicators. Expect “Starting import” followed by “Importing” and completion without a terminal command. The original upload request finishes before batch processing begins.
2. **Recovery:** reload/navigate away and return. The same import and counters return. Hide the tab or disconnect: polling pauses; reconnect while visible and polling resumes every two seconds.
3. **Processing:** check created/updated/unchanged/skipped/row-error counters and open **View review notes**. Verify row numbers, note pagination, keyboard close and mobile layout. CSV export is optional. Warnings about local program links do not mean student rows were rejected.
4. **Idempotency:** upload the same file again. Student count stays constant; records become unchanged. Change a mapped field and reupload: updated increments. Existing birth dates/student IDs and students absent from the workbook remain.
5. **Validation:** use test copies with an invalid graduation date, missing required field, wrong headers, duplicate identical records, and conflicting HEI+SO rows across chunk boundaries. Expect explicit issues; conflicting rows must not overwrite one another.
6. **Links:** verify exact institution/program/major linking and ambiguous-match warnings. Search Graduates by Excel program, major, PSCED, institution name and SO number.
7. **Institution dialog:** open the matching institution/program. Confirm the student appears, year filtering works, and more than 25 students paginate. Different majors must not mix.
8. **Retry:** in an isolated test environment, interrupt a worker and restart after the reservation/lock intervals. Failed work should become retryable. Retry from Import history; completed chunks/counts must not repeat. A newer upload prevents retrying an older failed run to avoid overwriting newer data; upload a corrected masterlist instead.
9. **Concurrency/permissions:** try another upload or Clear all graduates during an import; expect HTTP 409. Users without `import_graduates` cannot upload, see history/status, retry, or download issues. Verify direct requests as well as UI controls.
10. **UI:** review desktop/mobile, keyboard focus, dark mode, error states, history pages and issue downloads. An active import intentionally disables the upload button.
11. **Cleanup:** run `php artisan graduates:prune-imports` in an isolated database with a completed run older than 30 days. Source/parts/staged rows disappear; history/issues/audit remain. Failed and queued sources remain.

## Automated verification

```powershell
php -d extension=pdo_sqlite vendor/bin/pest tests/Feature/GraduateImportsTest.php tests/Feature/ProgramsModuleTest.php
npx vitest run
npx playwright test
npx tsc --noEmit --ignoreDeprecations 5.0
npm run build
```

The explicit SQLite extension is needed by this Windows CLI configuration; omit it when already enabled. Playwright uses an isolated SQLite database and synthetic records, starts its own test server, and defaults to installed Edge. Set `PLAYWRIGHT_CHANNEL` appropriately elsewhere. Build assets before running browser tests. The TypeScript override accommodates the repository's existing TS5/ignoreDeprecations6 configuration mismatch.

Generate and benchmark without touching the application database:

```powershell
python tests/Support/generate-soais.py 40000
python tests/Support/generate-soais.py 80000
php -d extension=pdo_sqlite tests/Support/benchmark-soais.php 40000
php -d extension=pdo_sqlite tests/Support/benchmark-soais.php 80000
```

Results are written to ignored `storage/framework/testing/benchmark-N.json`. The script uses a new isolated SQLite database and invokes real job handlers with fake queue dispatch. It measures initialization, chunk processing, PHP peak memory and a database search, and fails its capacity check if a job exceeds 45 seconds or PHP memory reaches 256 MB. It is not a GoDaddy/MySQL/concurrent HTTP benchmark. Native process memory requires an OS monitor in addition to PHP memory reporting.

## Results and limitations

- The provided 19-student sample was processed successfully against local MySQL: 19 existing students updated, no new duplicates, no invalid rows, one template row skipped. Nineteen local-program-link warnings retained the Excel information.
- Targeted backend suite: 34 tests / 184 assertions passed, including Programs regression coverage, automatic browser processing, review-note authorization/pagination, 1904-calendar dates, truncated XML rejection, and surviving worker locks.
- Browser upload → queued → reload → actual database worker → completed → Graduates search → Institution dialog passed. Mobile layout was checked at 390px with no page overflow.
- Both browser workflows passed (Programs/Catalog and Students), along with five frontend tests, targeted ESLint/Prettier, PHP formatting, TypeScript with the documented override, and the production build.
- Local synthetic capacity results are recorded below. Large production imports remain gated on hosting validation.
- The broader existing backend suite has unrelated authentication/registration/ExampleTest failures. Existing whole-project lint issues are outside this change; targeted lint and type checks are used.

| Synthetic rows | Total processing | Initialization | Slowest 500-row job | Peak PHP memory | Search query |
| --- | --- | --- | --- | --- | --- |
| 40,000 | 28.61 s | 4.70 s | 0.57 s | 40 MB | 15.58 ms |
| 80,000 | 103.40 s | 20.15 s | 0.69 s | 40 MB | 25.44 ms |

Both sizes created the expected number of records with no invalid rows. A separate OS observation of an 80k run recorded 67.53 MB peak working set. These measurements use synthetic inline-string XLSX files on local Windows/SQLite and exclude cron waiting intervals. Search timing is one database query, not an end-to-end concurrent browsing SLA.

Earlier runs deliberately exposed two limitations: filtered workbook loading exceeded 1 GB native memory (replaced by the streaming XLSX reader), and local contention produced a 46-second chunk pause. Initialization was optimized to avoid traversing each row twice. The final run passed, but shared-host resource contention can still cause timeout/retry; validate with representative files on staging and do not infer a production guarantee from these local results.

### Browser upload capacity (latest flow)

An actual browser upload of **50,000 rows completed in 94.981 seconds**, including upload, HTTP processing batches and progress updates, with **no separate CLI worker**. All 50,000 rows were created, none rejected. The fixture deliberately produced 50,000 unmatched-program review notes; the paginated drawer opened successfully. This used local Windows and isolated SQLite, not GoDaddy. The result is in `storage/framework/testing/browser-benchmark-50000.json`.

Repeat after building the frontend:

```powershell
python tests/Support/generate-soais.py 50000
$env:RUN_LARGE_IMPORT='1'
npx playwright test tests/browser/students.spec.ts
```

The large browser test is opt-in; ordinary browser tests use the small sample. Verify the hosted web request limit accommodates initialization and a batch request before deploying this browser-assisted path. PHP limits cannot override proxy/server deadlines. If browser requests time out on the host, retained database reservations and chunk transactions permit recovery; use the scheduled worker and inspect import errors.

### Official RS 2025 workbook validation

`RS 2025 for Uploading to SOAIS.xlsx` contains seven tabs. The importer now selects `SO Masterlist` and ignores its six reference tabs. Parser-only validation (no student database writes) found 21,813 worksheet rows after the headers: 20,202 valid students, 1,609 empty/template rows to skip, and two data errors. Excel row 9862 has sex `FM`; row 9965 has graduation date `*`. Correct those cells or allow them to appear as skipped-row review items. Existing failed initialization can use **Retry failed work** after deploying this update; re-uploading is unnecessary while its private source file is retained.
