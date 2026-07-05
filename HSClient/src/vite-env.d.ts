/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SAY_HI_ENABLED?: string;
  readonly VITE_SAY_HI_ENDPOINT?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
