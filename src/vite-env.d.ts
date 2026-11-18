/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_BUSINESS_ID?: string;
  readonly VITE_AUTO_SYNC_CONFIG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
