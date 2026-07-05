import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript('localStorage.clear()');
});

test('recruiter release homepage exposes verified content and no unfinished demos', async ({
  page,
  request,
}) => {
  const consoleErrors: string[] = [];
  const failedGlbRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (requestEvent) => {
    if (requestEvent.url().endsWith('.glb')) {
      failedGlbRequests.push(requestEvent.url());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hugo Spångberg' })).toBeVisible();
  await expect(page.locator('#local-ai')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lokal AI-station & personlig automation' })).toBeVisible();

  await page.locator('#local-ai').scrollIntoViewIfNeeded();
  await expect(page.locator('.local-ai-scene')).toHaveAttribute(
    'data-scene-status',
    /loading|ready|fallback/,
  );
  await expect(page.locator('.local-ai-scene')).toHaveAttribute(
    'data-scene-status',
    /ready|fallback/,
    { timeout: 20_000 },
  );

  const cvLink = page.getByRole('link', { name: /ladda ner cv pdf/i }).first();
  await expect(cvLink).toHaveAttribute('download', 'Hugo-Spangberg-CV-2026.pdf');
  const cvHref = await cvLink.getAttribute('href');
  expect(cvHref).toContain('documents/Hugo-Spangberg-CV-2026.pdf');
  const cvResponse = await request.get(cvHref ?? '');
  expect(cvResponse.ok()).toBe(true);
  expect(cvResponse.headers()['content-type']).toContain('application/pdf');

  await expect(page.locator('body')).not.toContainText(/reference|referens/i);
  await expect(page.locator('body')).not.toContainText(/coming later|läggs till senare/i);
  await expect(page.locator('body')).not.toContainText(/under construction|under uppbyggnad/i);
  await expect(page.locator('#say-hi')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /say hi|säg hej/i })).toHaveCount(0);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Home AI Station & Personal Automation' })).toBeVisible();
  await expect(page.getByRole('link', { name: /download cv pdf/i }).first()).toBeVisible();

  expect(failedGlbRequests).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
