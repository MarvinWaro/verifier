import { expect, test } from '@playwright/test';

test('program browsing, permits, catalog edits, mobile and dark layout', async ({
    page,
}) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('browser@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('browser-test-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('/programs');
    await expect(
        page.getByRole('button', { name: 'Refresh from portal' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Permit' })).toHaveCount(
        10,
    );
    await page.screenshot({
        path: 'test-results/programs-desktop.png',
        fullPage: true,
    });
    await page.route('**/permit-pdf*', (route) =>
        route.fulfill({
            status: 502,
            json: { error: 'Fixture has no PDF binary' },
        }),
    );
    await page.getByPlaceholder(/Search.*program/i).fill('Science Program 01');
    await page.getByRole('button', { name: 'View Permit' }).click();
    await expect(
        page.getByRole('dialog').getByText('Document linked', { exact: true }),
    ).toBeVisible();
    await expect(
        page
            .getByRole('dialog')
            .getByText('Permit number not recorded', { exact: true }),
    ).toBeVisible();
    await expect(
        page.getByRole('dialog').getByText('CHECK WITH CHED', { exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByPlaceholder(/Search.*program/i).fill('GR-2');
    await expect(
        page.getByText('Science Program 02', { exact: true }),
    ).toBeVisible();
    await page.getByPlaceholder(/Search.*program/i).fill('Science Program 02');
    await page.getByRole('button', { name: 'View Permit' }).click();
    await expect(
        page
            .getByRole('dialog')
            .getByText('Permit Number Recorded', { exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByPlaceholder(/Search.*program/i).fill('Science Program 03');
    await page.getByRole('button', { name: 'View Permit' }).click();
    await expect(
        page
            .getByRole('dialog')
            .getByRole('heading', { name: 'CHECK WITH CHED' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByPlaceholder(/Search.*program/i).fill('');
    // Exercise a real server-side refresh failure: fixtures point to a closed local port.
    await page.getByRole('button', { name: 'Refresh from portal' }).click();
    await expect(
        page.getByText(/Could not fetch updates from the portal/),
    ).toBeVisible({ timeout: 35_000 });
    await expect(page.getByRole('button', { name: 'View Permit' })).toHaveCount(
        10,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({
        path: 'test-results/programs-mobile-dark.png',
        fullPage: true,
    });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
    await page.getByRole('combobox', { name: 'Choose institution' }).click();
    await expect(page.getByPlaceholder(/Search institutions/)).toBeVisible();
    await page.keyboard.press('Escape');
    await page.goto('/programs/catalog');
    await expect(
        page.getByRole('button', { name: 'Sync catalog from portal' }),
    ).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: 'Science Program 01' });
    await row.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Board', exact: true }).click();
    await expect(row.getByRole('combobox')).toContainText('Board');
    await page.reload();
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: 'Science Program 01' })
            .getByRole('combobox'),
    ).toContainText('Board');
    await page.screenshot({
        path: 'test-results/catalog-mobile.png',
        fullPage: true,
    });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
    await page
        .getByRole('button', { name: 'Sync catalog from portal' })
        .click();
    await expect(page.getByText('queued', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('queued', { exact: true })).toBeVisible();
});
