import { expect, test } from '@playwright/test';

const adminPages = [
    '/dashboard',
    '/institutions',
    '/programs',
    '/programs/catalog',
    '/graduates',
    '/settings/import',
    '/settings/users',
    '/settings/roles',
    '/settings/concerns',
    '/logs',
];

test('admin modules avoid light-only surfaces in dark mode', async ({
    page,
}) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('browser@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('browser-test-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');

    for (const path of adminPages) {
        await page.goto(path);
        await page.evaluate(() =>
            document.documentElement.classList.add('dark'),
        );
        await expect(page.locator('body')).toBeVisible();

        const lightSurfaces = await page.locator('body').evaluate((body) =>
            [...body.querySelectorAll<HTMLElement>('*')]
                .filter((element) => {
                    const rect = element.getBoundingClientRect();
                    if (rect.width < 180 || rect.height < 35) return false;
                    if (rect.bottom < 0 || rect.top > innerHeight) return false;

                    const color = getComputedStyle(element).backgroundColor;
                    const channels = color.match(/\d+(?:\.\d+)?/g)?.map(Number);
                    if (!channels || channels.length < 3) return false;

                    return channels
                        .slice(0, 3)
                        .every((channel) => channel > 240);
                })
                .slice(0, 5)
                .map((element) => ({
                    tag: element.tagName,
                    classes: element.className,
                    text: element.textContent?.trim().slice(0, 80),
                })),
        );

        expect(lightSurfaces, `${path} has light-only surfaces`).toEqual([]);
    }
});
