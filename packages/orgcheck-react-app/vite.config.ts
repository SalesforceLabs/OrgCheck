import { existsSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import salesforce from '@salesforce/vite-plugin-ui-bundle';
import codegen from 'vite-plugin-graphql-codegen';
import basicSsl from '@vitejs/plugin-basic-ssl';

const schemaPath = resolve(__dirname, '../orgcheck-salesforce-app/schema.graphql');
const schemaExists = existsSync(schemaPath);
const orgCheckApiSrc = resolve(__dirname, '../orgcheck-api/src');

function orgCheckApiSrcAlias(): import('vite').Plugin {
  return {
    name: 'orgcheck-api-src-alias',
    enforce: 'pre',
    async resolveId(id, importer, options) {
      if (!id.startsWith('src/') || !importer) return null;
      if (!importer.replaceAll('\\', '/').includes('/orgcheck-api/')) {
        return null;
      }
      return this.resolve(resolve(orgCheckApiSrc, id.slice('src/'.length)), importer, {
        ...options,
        skipSelf: true,
      });
    },
  };
}

function isAllowedSalesforceLoginHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === 'login.salesforce.com' ||
    host === 'test.salesforce.com' ||
    host.endsWith('.my.salesforce.com')
  );
}

function isAllowedSalesforceInstanceHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'login.salesforce.com' || host === 'test.salesforce.com') return false;
  return (
    host.endsWith('.my.salesforce.com') ||
    host.endsWith('.salesforce.com') ||
    host.endsWith('.force.com') ||
    host.endsWith('.cloudforce.com')
  );
}

function readCookie(req: IncomingMessage, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const piece of header.split(';')) {
    const [cookieName, ...rest] = piece.trim().split('=');
    if (cookieName === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

function readRequestBuffer(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function outboundSalesforceHeaders(req: IncomingMessage): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const raw = Array.isArray(value) ? value.join(', ') : value;
    if (typeof raw !== 'string' || raw.length === 0) continue;
    const lower = name.toLowerCase();
    if (
      lower.startsWith(':') ||
      lower === 'host' ||
      lower === 'connection' ||
      lower === 'content-length' ||
      lower === 'cookie' ||
      lower === 'origin' ||
      lower === 'referer' ||
      lower === 'accept-encoding' ||
      lower === 'keep-alive' ||
      lower === 'transfer-encoding' ||
      lower === 'te' ||
      lower === 'trailer' ||
      lower === 'upgrade' ||
      lower === 'http2-settings'
    ) {
      continue;
    }
    headers[name] = raw;
  }
  return headers;
}

function oauthCallbackIndexFallback() {
  return (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
    const raw = req.url ?? '/';
    const pathname = raw.split('?')[0];
    if (pathname === '/orgcheck-login' || pathname === '/oauth/callback') {
      const query = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
      req.url = `/index.html${query}`;
    }
    next();
  };
}

function oauthSalesforceProxy() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const pathname = (req.url ?? '/').split('?')[0];
    const kind =
      pathname === '/__orgcheck/oauth/token'
        ? 'token'
        : pathname === '/__orgcheck/oauth/revoke'
          ? 'revoke'
          : undefined;
    if (kind) {
      void forwardSalesforceOAuth(kind, req, res);
      return;
    }
    if (pathname.startsWith('/services/')) {
      void forwardSalesforceApi(req, res);
      return;
    }
    next();
  };
}

async function forwardSalesforceOAuth(
  kind: 'token' | 'revoke',
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const sendJson = (status: number, payload: Record<string, string>) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };
  if (req.method !== 'POST') {
    sendJson(405, { error: 'method_not_allowed', error_description: 'OAuth proxy accepts POST only.' });
    return;
  }
  try {
    const loginHeader = req.headers['x-orgcheck-login-url'];
    const loginValue = Array.isArray(loginHeader) ? loginHeader[0] : loginHeader;
    if (!loginValue) {
      sendJson(400, {
        error: 'invalid_request',
        error_description: 'Missing X-OrgCheck-Login-Url header.',
      });
      return;
    }
    const loginUrl = new URL(loginValue);
    if (loginUrl.protocol !== 'https:' || !isAllowedSalesforceLoginHost(loginUrl.hostname)) {
      sendJson(400, {
        error: 'invalid_request',
        error_description: `Login host is not allowed: ${loginUrl.hostname}`,
      });
      return;
    }
    const target = new URL(`/services/oauth2/${kind}`, `${loginUrl.protocol}//${loginUrl.host}`);
    const body = await readRequestBuffer(req);
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      redirect: 'manual',
    });
    const text = await response.text();
    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    });
    res.end(text);
  } catch (cause) {
    sendJson(502, {
      error: 'proxy_failed',
      error_description: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

async function forwardSalesforceApi(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sendJson = (status: number, payload: Record<string, string>) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };
  try {
    const instanceHeader = req.headers['x-orgcheck-instance-url'];
    const instanceValue =
      (Array.isArray(instanceHeader) ? instanceHeader[0] : instanceHeader) ??
      readCookie(req, 'orgcheck_sf_instance');
    if (!instanceValue) {
      sendJson(401, {
        error: 'invalid_session',
        error_description: 'Missing Salesforce instance. Sign in again.',
      });
      return;
    }
    const instanceUrl = new URL(instanceValue);
    if (instanceUrl.protocol !== 'https:' || !isAllowedSalesforceInstanceHost(instanceUrl.hostname)) {
      sendJson(400, {
        error: 'invalid_request',
        error_description: `Salesforce instance host is not allowed: ${instanceUrl.hostname}`,
      });
      return;
    }
    const incoming = new URL(req.url ?? '/', 'https://localhost');
    const target = new URL(incoming.pathname + incoming.search, `${instanceUrl.protocol}//${instanceUrl.host}`);
    const method = req.method ?? 'GET';
    const body = method !== 'GET' && method !== 'HEAD' ? await readRequestBuffer(req) : undefined;
    const response = await fetch(target, {
      method,
      headers: outboundSalesforceHeaders(req),
      body,
      redirect: 'manual',
    });
    const responseHeaders: Record<string, string> = {};
    const contentType = response.headers.get('content-type');
    if (contentType) responseHeaders['Content-Type'] = contentType;
    const limitInfo = response.headers.get('sforce-limit-info');
    if (limitInfo) responseHeaders['Sforce-Limit-Info'] = limitInfo;
    const buffer = Buffer.from(await response.arrayBuffer());
    res.writeHead(response.status, responseHeaders);
    res.end(buffer);
  } catch (cause) {
    sendJson(502, {
      error: 'proxy_failed',
      error_description: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

function orgCheckLocalOAuth(): import('vite').Plugin {
  return {
    name: 'orgcheck-local-oauth',
    configureServer(server) {
      server.middlewares.use(oauthSalesforceProxy());
      return () => {
        server.middlewares.use(oauthCallbackIndexFallback());
      };
    },
    configurePreviewServer(server) {
      server.middlewares.use(oauthSalesforceProxy());
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      orgCheckApiSrcAlias(),
      orgCheckLocalOAuth(),
      basicSsl(),
      tailwindcss(),
      react(),
      salesforce(),
      ...(schemaExists
        ? [
            codegen({
              configFilePathOverride: resolve(__dirname, 'codegen.yml'),
              runOnStart: true,
              runOnBuild: true,
              enableWatcher: true,
              throwOnBuild: true,
            }),
          ]
        : []),
    ] as import('vite').PluginOption[],

    build: {
      outDir: resolve(__dirname, 'dist'),
      assetsDir: 'assets',
      sourcemap: false,
    },

    define: {
      global: 'globalThis',
    },

    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      headers: {
        'Cache-Control': 'no-store',
      },
    },

    preview: {
      host: 'localhost',
      port: 4173,
      strictPort: true,
    },

    optimizeDeps: {
      include: ['d3', 'xlsx', 'fflate'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },

    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: [
        {
          find: '@orgcheck/api',
          replacement: resolve(orgCheckApiSrc, 'orgcheck.ts'),
        },
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@api', replacement: path.resolve(__dirname, './src/api') },
        {
          find: '@components',
          replacement: path.resolve(__dirname, './src/components'),
        },
        { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
        {
          find: '@styles',
          replacement: path.resolve(__dirname, './src/styles'),
        },
        {
          find: '@assets',
          replacement: path.resolve(__dirname, './src/assets'),
        },
      ],
    },

    test: {
      root: resolve(__dirname),
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'clover', 'json'],
        exclude: [
          'node_modules/',
          'src/test/',
          'src/**/*.d.ts',
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/components/**/index.ts',
          '**/*.config.ts',
          'build/',
          'dist/',
          'coverage/',
          'eslint.config.js',
        ],
        thresholds: {
          global: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
          },
        },
      },
      testTimeout: 10000,
      globals: true,
    },
  };
});
