/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  readonly BUILD_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
