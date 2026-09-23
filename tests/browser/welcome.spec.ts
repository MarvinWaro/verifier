import { expect, test } from '@playwright/test';

test('public institution lookup works across desktop and mobile dark mode', async ({
    page,
}) => {
    await page.goto('/');
    await expect(
        page.getByRole('heading', { name: 'Search by Institution' }),
    ).toBeVisible();
    await page.screenshot({
        path: 'test-results/welcome-desktop.png',
        fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const searchBox = await page
        .getByRole('search', { name: 'Institution lookup' })
        .boundingBox();
    const map = await page
        .getByRole('region', { name: 'Higher education institutions map' })
        .boundingBox();
    expect(searchBox).not.toBeNull();
    expect(map).not.toBeNull();
    expect(searchBox!.y).toBeLessThan(map!.y);

    await page
        .getByPlaceholder('Enter institution code or name...')
        .fill('Example State College');
    await page
        .getByLabel('Institution code or name')
        .press('Enter');
    await expect(page.getByText('Example State College')).toBeVisible();
    await page.getByRole('button', { name: /Example State College/ }).click();
    await expect(page.getByText('Science Program 02')).toBeVisible();
    await page.getByRole('button', { name: 'View permit' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.screenshot({
        path: 'test-results/welcome-mobile-dark.png',
        fullPage: true,
        animations: 'disabled',
    });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
});
