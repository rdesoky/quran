/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENABLE_SW: string;
    readonly PUBLIC_URL: string;
    readonly BASE_URL: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
