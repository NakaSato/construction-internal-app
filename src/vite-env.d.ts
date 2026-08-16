/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Global type definitions for better TypeScript support
declare global {
  type HeadersInit = Record<string, string> | Headers | string[][];
  type RequestInit = {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    signal?: AbortSignal | null;
  };
  type RequestCache =
    | "default"
    | "no-store"
    | "reload"
    | "no-cache"
    | "force-cache"
    | "only-if-cached";

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      [key: string]: string | undefined;
    }
    interface Timeout {
      ref(): this;
      unref(): this;
    }
  }

  var process: {
    env: NodeJS.ProcessEnv;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV: string;
  readonly VITE_JWT_SECRET?: string;
  readonly VITE_TOKEN_EXPIRY?: string;
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
