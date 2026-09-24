import { getRouterBasename } from '@/lib/paths';

const CLIENT_ID_KEY = 'orgcheck.oauth.clientId';
const LOGIN_URL_KEY = 'orgcheck.oauth.loginUrl';
const SESSION_KEY = 'orgcheck.oauth.session';
const PKCE_KEY = 'orgcheck.oauth.pkce';
const PKCE_COOKIE = 'orgcheck_oauth_pkce';
const INSTANCE_COOKIE = 'orgcheck_sf_instance';
const CALLBACK_PATH = '/orgcheck-login';
const CALLBACK_PATHS = [CALLBACK_PATH, '/oauth/callback'];
const LOCAL_OAUTH_PREFIX = '/__orgcheck/oauth';
const IDLE_MS = 30 * 60 * 1000;
const CODE_VERIFIER_BYTES = 32;
const STATE_BYTES = 32;

export const PRODUCTION_LOGIN_URL = 'https://login.salesforce.com';
export const SANDBOX_LOGIN_URL = 'https://test.salesforce.com';

export type OAuthSession = {
  accessToken: string;
  instanceUrl: string;
  refreshToken?: string;
  loginUrl: string;
  lastActivity: number;
};

type PkcePending = {
  verifier: string;
  state: string;
  loginUrl: string;
  clientId: string;
  redirectUri: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  instance_url?: string;
  error?: string;
  error_description?: string;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return diff === 0;
}

export function isAllowedLoginHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === 'login.salesforce.com' ||
    host === 'test.salesforce.com' ||
    host.endsWith('.my.salesforce.com')
  );
}

export function assertLoginUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Login URL is not a valid URL.');
  }
  if (url.protocol !== 'https:') {
    throw new Error('Login URL must use HTTPS.');
  }
  if (url.username || url.password) {
    throw new Error('Login URL must not include credentials.');
  }
  if (!isAllowedLoginHost(url.hostname)) {
    throw new Error(
      'Login URL must be login.salesforce.com, test.salesforce.com, or a My Domain (*.my.salesforce.com).'
    );
  }
  return new URL(`${url.protocol}//${url.host}`);
}

export function assertClientId(value: string): string {
  const clientId = value.trim();
  if (clientId.length < 8 || clientId.length > 256 || /\s/.test(clientId)) {
    throw new Error('Enter a valid Connected App Consumer Key.');
  }
  return clientId;
}

function utf8ToBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToUtf8(value: string): string {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function getOAuthRedirectUri(): string {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

export function isOAuthCallbackLocation(
  pathname = window.location.pathname,
  search = window.location.search,
  hash = window.location.hash
): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (CALLBACK_PATHS.includes(path)) return true;
  const params = callbackSearchParams(`${search}${hash}`);
  return Boolean(params.get('code') || params.get('error'));
}

export function readSavedOAuthClient(): { clientId: string; loginUrl: string } {
  return {
    clientId: window.localStorage.getItem(CLIENT_ID_KEY) ?? import.meta.env.VITE_SF_CLIENT_ID ?? '',
    loginUrl: window.localStorage.getItem(LOGIN_URL_KEY) ?? PRODUCTION_LOGIN_URL,
  };
}

export function saveOAuthClient(clientId: string, loginUrl: string): void {
  window.localStorage.setItem(CLIENT_ID_KEY, clientId);
  window.localStorage.setItem(LOGIN_URL_KEY, loginUrl);
}

function readSession(): OAuthSession | undefined {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as OAuthSession;
    if (
      typeof parsed.accessToken === 'string' &&
      parsed.accessToken.length > 0 &&
      typeof parsed.instanceUrl === 'string' &&
      parsed.instanceUrl.startsWith('https://')
    ) {
      return parsed;
    }
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
  return undefined;
}

function writeSession(session: OAuthSession): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  rememberSalesforceInstanceUrl(session.instanceUrl);
}

let memoryPending: PkcePending | undefined;
let inFlightCallback: Promise<OAuthSession> | undefined;

function parsePending(raw: string): PkcePending | undefined {
  try {
    const parsed = JSON.parse(raw) as PkcePending;
    if (
      typeof parsed.verifier === 'string' &&
      typeof parsed.state === 'string' &&
      typeof parsed.loginUrl === 'string' &&
      typeof parsed.clientId === 'string' &&
      typeof parsed.redirectUri === 'string'
    ) {
      return parsed;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function readPendingCookie(): string | undefined {
  const pieces = document.cookie.split(';');
  for (const piece of pieces) {
    const [name, ...rest] = piece.trim().split('=');
    if (name === PKCE_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

function writePendingCookie(raw: string): void {
  document.cookie = `${PKCE_COOKIE}=${encodeURIComponent(raw)}; Max-Age=600; Path=/; SameSite=Lax; Secure`;
}

function clearPendingCookie(): void {
  document.cookie = `${PKCE_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
}

function readPending(): PkcePending | undefined {
  if (memoryPending) return memoryPending;
  const raw =
    window.sessionStorage.getItem(PKCE_KEY) ??
    window.localStorage.getItem(PKCE_KEY) ??
    readPendingCookie();
  if (!raw) return undefined;
  const parsed = parsePending(raw);
  if (!parsed) {
    window.sessionStorage.removeItem(PKCE_KEY);
    window.localStorage.removeItem(PKCE_KEY);
    clearPendingCookie();
    return undefined;
  }
  memoryPending = parsed;
  return parsed;
}

function writePending(pending: PkcePending): void {
  memoryPending = pending;
  const raw = JSON.stringify(pending);
  window.sessionStorage.setItem(PKCE_KEY, raw);
  window.localStorage.setItem(PKCE_KEY, raw);
  writePendingCookie(raw);
}

function clearPending(): void {
  memoryPending = undefined;
  window.sessionStorage.removeItem(PKCE_KEY);
  window.localStorage.removeItem(PKCE_KEY);
  clearPendingCookie();
}

function pendingFromState(state: string): PkcePending | undefined {
  try {
    return parsePending(base64UrlToUtf8(state));
  } catch {
    return undefined;
  }
}

export function isLocalSalesforceDevHost(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export function rememberSalesforceInstanceUrl(instanceUrl: string): void {
  if (!isLocalSalesforceDevHost() || !instanceUrl.startsWith('https://')) return;
  document.cookie = `${INSTANCE_COOKIE}=${encodeURIComponent(instanceUrl)}; Max-Age=${Math.floor(IDLE_MS / 1000)}; Path=/; SameSite=Lax; Secure`;
}

function clearInstanceCookie(): void {
  document.cookie = `${INSTANCE_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
}

function usesLocalOAuthProxy(): boolean {
  return isLocalSalesforceDevHost();
}

function oauthEndpoint(
  kind: 'token' | 'revoke',
  loginUrl: string
): { url: string; headers: HeadersInit; salesforceUrl: string } {
  const salesforceUrl = new URL(`/services/oauth2/${kind}`, loginUrl).toString();
  if (usesLocalOAuthProxy()) {
    return {
      url: `${LOCAL_OAUTH_PREFIX}/${kind}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-OrgCheck-Login-Url': loginUrl,
      },
      salesforceUrl,
    };
  }
  return {
    url: salesforceUrl,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    salesforceUrl,
  };
}

function oauthHintForError(error?: string, description?: string): string {
  const text = `${error ?? ''} ${description ?? ''}`.toLowerCase();
  if (text.includes('invalid_client_id')) {
    return 'External Client App: the Consumer Key is wrong, or it belongs to a different environment (production vs sandbox).';
  }
  if (text.includes('invalid_client') && text.includes('proof key')) {
    return 'External Client App: require PKCE for the authorization-code flow.';
  }
  if (text.includes('invalid_client') || text.includes('client credentials')) {
    return 'External Client App: Consumer Key is wrong, or a client secret is required. For this browser app, turn off requiring a client secret for the web-server / authorization-code flow.';
  }
  if (text.includes('redirect_uri') || text.includes('redirect uri')) {
    return `External Client App callback URL must be exactly ${getOAuthRedirectUri()}.`;
  }
  if (text.includes('invalid_grant')) {
    return 'The authorization code expired or was already used, or the callback URL does not match. Start login again.';
  }
  if (text.includes('invalid_scope')) {
    return 'External Client App OAuth scopes must include api, refresh_token, and the identity URL (id / openid).';
  }
  return 'External Client App: enable the authorization-code flow with PKCE, add the callback URL from the login card, and do not require a client secret.';
}

function formatTokenFailure(details: {
  status?: number;
  tokenUrl: string;
  salesforceUrl: string;
  payload?: TokenResponse;
  raw?: string;
  network?: string;
  clientId?: string;
}): string {
  const lines = [
    details.network
      ? `Token exchange failed: ${details.network}`
      : `Token exchange failed (HTTP ${details.status ?? 'unknown'}).`,
    `App origin: ${window.location.origin}`,
    `Request URL: ${details.tokenUrl}`,
    `Salesforce token URL: ${details.salesforceUrl}`,
    `Callback URL used: ${getOAuthRedirectUri()}`,
  ];
  if (details.clientId) {
    lines.push(`Consumer Key: ${details.clientId}`);
  }
  if (details.payload?.error) {
    lines.push(`Salesforce error: ${details.payload.error}`);
  }
  if (details.payload?.error_description) {
    lines.push(`Salesforce message: ${details.payload.error_description.replaceAll('+', ' ')}`);
  } else if (details.raw && details.raw.trim().length > 0 && !details.payload?.error) {
    lines.push(`Salesforce response: ${details.raw.slice(0, 500)}`);
  }
  if (details.network && /failed to fetch|networkerror|load failed/i.test(details.network)) {
    lines.push(
      'Root cause: the browser blocked the response (almost always CORS). Salesforce does not allow https://localhost:5173 to call /services/oauth2/token directly, and adding localhost to the org CORS allowlist usually does not fix OAuth endpoints.'
    );
  }
  lines.push(oauthHintForError(details.payload?.error, details.payload?.error_description));
  return lines.join('\n');
}

async function postOAuthForm(
  kind: 'token' | 'revoke',
  loginUrl: string,
  body: URLSearchParams
): Promise<{ response: Response; tokenUrl: string; salesforceUrl: string; text: string }> {
  const endpoint = oauthEndpoint(kind, loginUrl);
  let response: Response;
  try {
    response = await fetch(endpoint.url, {
      method: 'POST',
      headers: endpoint.headers,
      body,
    });
  } catch (cause) {
    throw new Error(
      formatTokenFailure({
        tokenUrl: endpoint.url,
        salesforceUrl: endpoint.salesforceUrl,
        network: cause instanceof Error ? cause.message : String(cause),
      })
    );
  }
  const text = await response.text();
  return { response, tokenUrl: endpoint.url, salesforceUrl: endpoint.salesforceUrl, text };
}

function callbackSearchParams(locationHref: string): URLSearchParams {
  try {
    const url = new URL(locationHref, window.location.origin);
    if (url.searchParams.get('code') || url.searchParams.get('error')) {
      return url.searchParams;
    }
    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    return new URLSearchParams(hash.startsWith('?') ? hash.slice(1) : hash);
  } catch {
    const fromQuery = new URLSearchParams(locationHref.startsWith('?') ? locationHref : `?${locationHref}`);
    if (fromQuery.get('code') || fromQuery.get('error')) return fromQuery;
    return new URLSearchParams();
  }
}

export function clearOAuthSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
  clearPending();
  clearInstanceCookie();
}

export function getOAuthSession(): OAuthSession | undefined {
  const session = readSession();
  if (!session) return undefined;
  if (Date.now() - session.lastActivity > IDLE_MS) {
    clearOAuthSession();
    return undefined;
  }
  return session;
}

export function touchOAuthActivity(): void {
  const session = readSession();
  if (!session) return;
  session.lastActivity = Date.now();
  writeSession(session);
}

export function isOAuthSessionIdle(): boolean {
  const session = readSession();
  if (!session) return false;
  return Date.now() - session.lastActivity > IDLE_MS;
}

export async function startOAuthLogin(clientIdInput: string, loginUrlInput: string): Promise<void> {
  const clientId = assertClientId(clientIdInput);
  const loginOrigin = assertLoginUrl(loginUrlInput);
  const redirectUri = getOAuthRedirectUri();
  const verifier = randomBase64Url(CODE_VERIFIER_BYTES);
  const state = randomBase64Url(STATE_BYTES);
  const challenge = await sha256Base64Url(verifier);
  const pending: PkcePending = {
    verifier,
    state,
    loginUrl: loginOrigin.origin,
    clientId,
    redirectUri,
  };
  writePending(pending);
  saveOAuthClient(clientId, loginOrigin.origin);

  const authorize = new URL('/services/oauth2/authorize', loginOrigin);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'api id refresh_token');
  authorize.searchParams.set('state', utf8ToBase64Url(JSON.stringify(pending)));
  authorize.searchParams.set('code_challenge', challenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  authorize.searchParams.set('prompt', 'login');
  window.location.assign(authorize.toString());
}

export async function completeOAuthCallback(
  locationHref = window.location.href
): Promise<OAuthSession> {
  const existing = getOAuthSession();
  if (existing) return existing;
  inFlightCallback ??= exchangeAuthorizationCode(locationHref).finally(() => {
    inFlightCallback = undefined;
  });
  return inFlightCallback;
}

async function exchangeAuthorizationCode(locationHref: string): Promise<OAuthSession> {
  const existing = getOAuthSession();
  if (existing) return existing;

  const params = callbackSearchParams(locationHref);
  const oauthError = params.get('error');
  if (oauthError) {
    const description = params.get('error_description') ?? oauthError;
    clearPending();
    throw new Error(description.replaceAll('+', ' '));
  }

  const code = params.get('code');
  const state = params.get('state');
  if (!code) {
    throw new Error(
      'Salesforce did not return an authorization code. Confirm the Connected App callback URL is exactly ' +
        getOAuthRedirectUri() +
        ' and start login again.'
    );
  }
  const pending = (state ? pendingFromState(state) : undefined) ?? readPending();
  if (!pending) {
    throw new Error(
      'Login state was lost after returning from Salesforce. Start login again from https://localhost:5173.'
    );
  }
  if (state && !pendingFromState(state) && !timingSafeEqual(state, pending.state)) {
    throw new Error('OAuth state mismatch. Start login again.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: pending.clientId,
    redirect_uri: pending.redirectUri,
    code_verifier: pending.verifier,
  });
  const { response, tokenUrl, salesforceUrl, text } = await postOAuthForm(
    'token',
    pending.loginUrl,
    body
  );
  let payload: TokenResponse = {};
  try {
    payload = JSON.parse(text) as TokenResponse;
  } catch {
    payload = {};
  }
  if (!response.ok || !payload.access_token || !payload.instance_url) {
    throw new Error(
      formatTokenFailure({
        status: response.status,
        tokenUrl,
        salesforceUrl,
        payload,
        raw: text,
        clientId: pending.clientId,
      })
    );
  }
  if (!payload.instance_url.startsWith('https://')) {
    throw new Error('Salesforce returned an invalid instance URL.');
  }

  const session: OAuthSession = {
    accessToken: payload.access_token,
    instanceUrl: payload.instance_url,
    refreshToken: payload.refresh_token,
    loginUrl: pending.loginUrl,
    lastActivity: Date.now(),
  };
  writeSession(session);
  clearPending();
  return session;
}

export async function revokeOAuthSession(): Promise<void> {
  const session = readSession();
  clearOAuthSession();
  if (!session) return;
  const token = session.refreshToken ?? session.accessToken;
  try {
    await postOAuthForm('revoke', session.loginUrl, new URLSearchParams({ token }));
  } catch {
    // Best-effort revoke; local session is already cleared.
  }
}

export function homePathAfterOAuth(): string {
  const basename = getRouterBasename();
  return basename === '/' ? '/' : `${basename}/`;
}
