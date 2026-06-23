import { test, expect } from '@playwright/test';

test('visitor can arm the lamp and send a mocked hello', async ({ page }) => {
  let accepted = false;

  await page.route('**/api/say-hi', async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as { requestId: string };

    if (accepted) {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'cooldown',
          requestId: body.requestId,
          retryAfterSeconds: 90,
        }),
      });
      return;
    }

    accepted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'accepted',
        requestId: body.requestId,
        cooldownSeconds: 120,
      }),
    });
  });

  await page.goto('/#say-hi');
  await page.getByRole('button', { name: /turn on digital lamp|tänd digital lampa/i }).click();
  await page.getByRole('button', { name: /send a hello|skicka ett hej/i }).click();
  await expect(page.getByRole('status')).toContainText(/hello received|hej mottaget/i);
  await expect(page.getByRole('status')).toContainText(/recently said hello|nyligen sagt hej/i, {
    timeout: 4000,
  });
});
