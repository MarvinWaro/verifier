import { expect, test } from '@playwright/test';

test('dashboard charts, filters, search and mobile dark mode', async ({
    page,
}) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('browser@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('browser-test-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(
        page.getByRole('heading', { name: 'Graduate analytics' }),
    ).toBeVisible();
    await page.goto('/import');
    await page.getByRole('tab', { name: 'Graduates' }).click();
    await page
        .getByLabel(/SOAIS workbook/)
        .setInputFiles('storage/framework/testing/browser-students.xlsx');
    await page.getByRole('button', { name: 'Upload Excel' }).click();
    await expect(
        page
            .getByRole('region', { name: 'Import progress' })
            .getByText(/Imported/),
    ).toBeVisible({ timeout: 30_000 });
    await page.goto('/dashboard');
    await expect(
        page.getByText('Sex distribution', { exact: true }),
    ).toBeVisible();
    await expect(
        page.getByText('Top institutions', { exact: true }),
    ).toBeVisible();
    await page
        .getByLabel('Graduation year', { exact: true })
        .selectOption('2024');
    await expect(page).toHaveURL(/year=2024/);
    await expect(page.getByText(/Monthly graduate records/)).toBeVisible();
    await page
        .getByRole('combobox', { name: 'Institution', exact: true })
        .click();
    await page
        .getByPlaceholder('Search school name or HEI code...')
        .fill('12001');
    await page.getByRole('option', { name: /Example State College/ }).click();
    await expect(page).toHaveURL(/institution=12001/);
    await page.reload();
    await expect(
        page.getByLabel('Graduation year', { exact: true }),
    ).toHaveValue('2024');
    await page.getByText('View chart data', { exact: true }).first().click();
    await expect(
        page
            .getByRole('cell', { name: 'Jun', exact: true })
            .or(page.getByRole('rowheader', { name: 'Jun', exact: true })),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Reset filters' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByPlaceholder(/Search graduates/).fill('SO-1');
    await expect(page.getByText('SO-1', { exact: true })).toBeVisible();
    await page.getByText('SO-1', { exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.screenshot({
        path: 'test-results/dashboard-desktop.png',
        fullPage: true,
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await expect(
        page.getByRole('heading', { name: 'Graduate analytics' }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.screenshot({
        path: 'test-results/dashboard-mobile-dark.png',
        fullPage: true,
    });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
});
