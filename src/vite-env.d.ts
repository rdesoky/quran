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

// Wake Lock API types
declare global {
    interface Navigator {
        wakeLock?: {
            request: (type: 'screen') => Promise<WakeLockSentinel>;
        };
    }

    interface WakeLockSentinel {
        released: boolean;
        type: 'screen';
        release: () => Promise<void>;
        addEventListener: (type: 'release', listener: () => void) => void;
        removeEventListener: (type: 'release', listener: () => void) => void;
    }
}
