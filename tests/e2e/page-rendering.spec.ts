import { test, expect } from '@playwright/test';

const pages = [
    {path: '/', title: 'Home'},
    {path: '/members', title: 'Members'},
    {path: '/about', title: 'About'},
    {path: '/sponsors', title: 'Sponsors'},

]

test.describe('Page rendering', () => {

  pages.forEach((pageInfo) => {

   test(`path ${pageInfo.path} does not return 404`, async ({ page }) => {
    const response = await page.goto(pageInfo.path);

    // test if page is non-existent and returns 404
    expect(response?.status()).not.toBe(404);
    expect(response!.status(), `${pageInfo.path} returned 404`).not.toBe(404);
    expect(response!.ok(), `${pageInfo.path} returned ${response!.status()}`).toBe(true);
                }
                )
            }
        )
    
    }
);