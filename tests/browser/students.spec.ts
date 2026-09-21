import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test('student upload, queue recovery, history and institution records', async ({
    page,
}) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('browser@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('browser-test-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('/import');
    await page.getByRole('tab', { name: 'Graduates' }).click();
    await page
        .getByLabel(/SOAIS workbook/)
        .setInputFiles('storage/framework/testing/browser-students.xlsx');
    await expect(
        page.getByRole('button', { name: 'Upload Excel' }),
    ).toBeEnabled();
    const uploaded = page.waitForResponse(
        (response) =>
            response.url().endsWith('/import/graduates') &&
            response.request().method() === 'POST',
    );
    let allowProcessing = false;
    await page.route('**/import/graduates/runs/*/process', async (route) => {
        if (allowProcessing) return route.continue();
        await route.fulfill({
            status: 503,
            json: { message: 'Test connection interruption' },
        });
    });
    await page.getByRole('button', { name: 'Upload Excel' }).click();
    const uploadResponse = await uploaded;
    expect(uploadResponse.status(), await uploadResponse.text()).toBe(202);
    await expect(
        page.getByRole('progressbar', { name: 'Spreadsheet preparation' }),
    ).not.toHaveAttribute('aria-valuenow');
    await expect(page.getByText('0 worksheet rows')).toHaveCount(0);
    await expect(page.getByText('0% processed')).toHaveCount(0);
    await expect(
        page.getByRole('status').filter({ hasText: 'Connection interrupted' }),
    ).toBeVisible();
    allowProcessing = true;
    await page.reload();
    await page.getByRole('tab', { name: 'Graduates' }).click();
    await expect(
        page
            .getByRole('region', { name: 'Import progress' })
            .getByText('Imported · review notes', { exact: true }),
    ).toBeVisible({ timeout: 30_000 });
    await page.reload();
    await page.getByRole('tab', { name: 'Graduates' }).click();
    await page.getByRole('button', { name: 'View review notes (1)' }).click();
    await expect(
        page.getByRole('dialog', { name: /Import review/ }),
    ).toBeVisible();
    await expect(page.getByText(/Excel row 4/)).toBeVisible();
    await expect(page.getByText(/No unique local program match/)).toBeVisible();
    await expect(
        page.getByRole('link', { name: /Export review as CSV/ }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.getByRole('button', { name: 'View review notes (1)' }).click();
    await expect(
        page.getByRole('dialog', { name: /Import review/ }),
    ).toBeVisible();
    await page.screenshot({
        path: 'test-results/student-review-mobile-dark.png',
        fullPage: false,
        animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await page.screenshot({
        path: 'test-results/students-mobile-dark.png',
        fullPage: true,
    });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    await page.goto('/graduates?q=Science');
    await expect(page.getByText('SO-1', { exact: true })).toBeVisible();
    await page.goto('/institutions');
    await page.getByText('Example State College', { exact: true }).click();
    await page
        .getByRole('button', {
            name: 'View graduates for Science Program 01 — Computing',
        })
        .click();
    await expect(
        page.getByRole('dialog').getByText('SO-1', { exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
});

test('50,000 rows import through the browser without a terminal worker', async ({
    page,
}) => {
    test.skip(
        process.env.RUN_LARGE_IMPORT !== '1',
        'Opt-in capacity test; generate the synthetic 50k workbook first.',
    );
    test.setTimeout(240_000);
    await page.goto('/login');
    await page.getByLabel('Email address').fill('browser@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('browser-test-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('/import');
    await page.getByRole('tab', { name: 'Graduates' }).click();
    await page
        .getByLabel(/SOAIS workbook/)
        .setInputFiles('storage/framework/testing/soais-50000.xlsx');
    const started = Date.now();
    const completed = page.waitForResponse(
        async (response) => {
            if (
                !response.url().endsWith('/process') ||
                response.status() !== 200
            )
                return false;
            const data = await response.json();
            return Boolean(data.run.finished_at);
        },
        { timeout: 220_000 },
    );
    await page.getByRole('button', { name: 'Upload Excel' }).click();
    const result = (await (await completed).json()).run;
    expect(result.counts.created).toBe(50000);
    expect(result.counts.invalid).toBe(0);
    const measurement = {
        rows: 50000,
        seconds: (Date.now() - started) / 1000,
        counts: result.counts,
        issues: result.issues,
        mode: 'browser HTTP batches, isolated SQLite, no CLI worker',
    };
    writeFileSync(
        'storage/framework/testing/browser-benchmark-50000.json',
        JSON.stringify(measurement, null, 2),
    );
    await page.getByRole('button', { name: /View review notes/ }).click();
    await expect(
        page.getByRole('dialog').getByText(/Excel row 4/),
    ).toBeVisible();
});
