export type Env = {
  ALLOWED_ORIGIN: string;
  TURNSTILE_SECRET_KEY: string;
  HOME_AUTOMATION_WEBHOOK_URL?: string;
  HOME_AUTOMATION_ACCESS_CLIENT_ID?: string;
  HOME_AUTOMATION_ACCESS_CLIENT_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  SAY_HI_ENABLED?: string;
  SAY_HI_COOLDOWN_SECONDS?: string;
  SAY_HI_PROVIDER?: string;
  SAY_HI_USE_MOCK_GATEWAY?: string;
  SAY_HI_RATE_LIMITER?: {
    limit: (input: { key: string }) => Promise<{ success: boolean }>;
  };
  SAY_HI_COOLDOWN: DurableObjectNamespace;
};
