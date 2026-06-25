import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript('localStorage.clear()');
});

test('career world opens a localized card and read more scrolls', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().includes('models/career-world/manifest.json') &&
      !message.text().includes('status of 500')
    ) {
      consoleErrors.push(message.text());
    }
  });
  await page.route('**/models/career-world/manifest.json', (route) =>
    route.fulfill({ status: 500, body: 'model manifest unavailable in interaction smoke' }),
  );

  await page.goto('/');
  await expect(page.locator('.world-scene')).toBeVisible();
  await expect(page.locator('.world-nav button')).toHaveCount(5);

  await page.getByRole('button', { name: 'Filmstaden' }).click();
  await expect(page.locator('.world-info-card')).toContainText('Ledarskap & service');

  await page.getByRole('button', { name: 'Läs mer' }).evaluate((button) => {
    button.click();
  });
  await expect(page.locator('#experience-filmstaden')).toBeInViewport();
  expect(consoleErrors).toEqual([]);
});

test('career world model failure keeps fallback navigation available', async ({ page }) => {
  await page.route('**/models/career-world/manifest.json', (route) =>
    route.fulfill({ status: 500, body: 'model manifest unavailable' }),
  );

  await page.goto('/');
  await expect(page.locator('.world-nav button')).toHaveCount(5);
  await page.getByRole('button', { name: 'Visma Enterprise' }).click();
  await expect(page.locator('.world-info-card')).toContainText('Technical Quality Assurer');
});

test('career world supports English content and mobile vertical scroll', async ({ page }) => {
  await page.route('**/models/career-world/manifest.json', (route) =>
    route.fulfill({ status: 500, body: 'model manifest unavailable in mobile smoke' }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('#world-intro-title')).toContainText('Interactive career world');

  await page.getByRole('button', { name: 'Dasa Control System' }).click();
  await expect(page.locator('.world-info-card')).toContainText('System Developer');

  const scrollableDistance = await page.evaluate<number>(
    'document.scrollingElement ? document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight : 0',
  );
  expect(scrollableDistance).toBeGreaterThan(0);
  await expect(page.locator('.world-scene__canvas canvas')).toHaveCSS('touch-action', 'pan-y');
});
