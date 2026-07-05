type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      size: 'invisible';
      callback: (token: string) => void;
      'error-callback': () => void;
      'timeout-callback': () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const testToken = '1x0000000000000000000000000000000AA';

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Turnstile failed.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile failed.')), {
      once: true,
    });
    document.head.append(script);
  });
}

export async function getTurnstileToken(container: HTMLElement): Promise<string> {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  if (!siteKey || import.meta.env.MODE === 'test') {
    return testToken;
  }

  await loadTurnstileScript();

  if (!window.turnstile) {
    throw new Error('Turnstile is unavailable.');
  }

  const turnstile = window.turnstile;

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      turnstile.reset(widgetId);
      reject(new Error('Turnstile timed out.'));
    }, 12_000);

    const widgetId = turnstile.render(container, {
      sitekey: siteKey,
      size: 'invisible',
      callback: (token) => {
        window.clearTimeout(timeout);
        resolve(token);
      },
      'error-callback': () => {
        window.clearTimeout(timeout);
        reject(new Error('Turnstile failed.'));
      },
      'timeout-callback': () => {
        window.clearTimeout(timeout);
        reject(new Error('Turnstile timed out.'));
      },
    });

    turnstile.execute(widgetId);
  });
}
