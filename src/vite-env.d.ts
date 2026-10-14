/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EDITOR_PASSCODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
