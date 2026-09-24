/// <reference types="vite/client" />

/** Salesforce API version injected at build time by the Vite define plugin. */
declare const __SF_API_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_SF_ACCESS_TOKEN?: string;
  readonly VITE_SF_INSTANCE_URL?: string;
  readonly VITE_SF_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface SfdcEnv {
  basePath?: string;
  accessToken?: string;
  sessionId?: string;
  instanceUrl?: string;
}

interface Window {
  SFDC_ENV?: SfdcEnv;
  jsforce?: unknown;
  orgcheck?: unknown;
  d3?: unknown;
  lightningflowscanner?: unknown;
}

interface GlobalThis {
  SFDC_ENV?: SfdcEnv;
  jsforce?: unknown;
  orgcheck?: unknown;
  d3?: unknown;
  lightningflowscanner?: unknown;
}
