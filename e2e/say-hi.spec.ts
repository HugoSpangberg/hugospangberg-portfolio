import { test, expect } from '@playwright/test';

test('visitor can send a mocked hello with one click', async ({ page }) => {
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
  await page.getByRole('button', { name: /click me|klicka på mig/i }).click();
  await expect(page.getByRole('dialog')).toContainText(/one of my lights|en av mina lampor/i);
  await page.getByRole('button', { name: /close|stäng/i }).click();
  await expect(page.getByRole('button', { name: /someone just said hi|någon har precis sagt hej/i })).toBeDisabled({
    timeout: 4000,
  });
});
