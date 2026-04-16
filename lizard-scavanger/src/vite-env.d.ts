/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SHARED_SENTRY_LOGIN?: string;
  readonly VITE_SHARED_AXIOM_LOGIN?: string;
  readonly VITE_AXIOM_DATASET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
