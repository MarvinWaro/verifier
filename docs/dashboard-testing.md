# Graduate dashboard testing

No migrations or new dependencies are required for this dashboard update. Build frontend assets with `npm run build`.

## Manual acceptance
1. Open Dashboard. Confirm four summary cards, graduation trends, sex distribution, top programs, and top institutions.
2. Choose a graduation year: the timeline changes to twelve monthly counts. Choose an institution using its name or HEI code.
3. Reload and use browser Back/Forward. Filters and totals should follow the URL. Reset returns to all records.
4. Change filters quickly. Only the latest response should remain visible.
5. Expand "View chart data" for exact values and full names. The sex legend includes counts and percentages, including unrecorded values.
6. Search for an SO number in Quick graduate search and open the existing details dialog. Search remains global.
7. Check mobile (390px), dark mode, keyboard controls, and reduced motion. No horizontal page scrolling should occur.
8. With mocked portal failure, confirm local analytics remain visible, school codes substitute for unavailable names, and the directory total shows unavailable rather than zero.
9. Missing graduation years belong in all-record totals but are explained separately from the timeline. Empty databases and filtered empty results have different messages.

## Automated checks
- `php -d extension=pdo_sqlite vendor/bin/pest tests/Feature/DashboardAnalyticsTest.php`
- `npx vitest run tests/frontend/dashboard.test.tsx`
- `npx playwright test tests/browser/dashboard.spec.ts` (isolated SQLite fixtures)
- `npx eslint resources/js/pages/dashboard.tsx tests/frontend/dashboard.test.tsx tests/browser/dashboard.spec.ts`
- `npx tsc --noEmit --ignoreDeprecations 5.0`
- `npx prettier --check resources/js/pages/dashboard.tsx tests/frontend/dashboard.test.tsx tests/browser/dashboard.spec.ts`
- `npm run build`

## Performance and limits
An isolated SQLite test with 80,000 synthetic graduates calculated filtered aggregates in approximately 0.25 seconds locally. Peak PHP memory for the complete test process, including framework and fixture setup, was 68 MiB. The response contains aggregates and filter options, not student rows.

This is not a GoDaddy benchmark. Validate production database response time after deployment. Analytics describe recorded graduates, not enrollment, graduation rates, or program accreditation. No additional analytics cache is introduced, so completed imports appear on the next dashboard request.
