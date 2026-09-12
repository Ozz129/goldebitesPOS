/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BANK_VERIFICATION_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
