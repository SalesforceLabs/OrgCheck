import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PRODUCTION_LOGIN_URL,
  SANDBOX_LOGIN_URL,
  getOAuthRedirectUri,
  readSavedOAuthClient,
  startOAuthLogin,
} from '@/lib/oauth';

type LoginKind = 'production' | 'sandbox' | 'custom';

function loginKindFromUrl(loginUrl: string): LoginKind {
  if (loginUrl === PRODUCTION_LOGIN_URL) return 'production';
  if (loginUrl === SANDBOX_LOGIN_URL) return 'sandbox';
  return 'custom';
}

export default function OAuthLogin({ initialError }: { initialError?: string }) {
  const saved = useMemo(() => readSavedOAuthClient(), []);
  const [kind, setKind] = useState<LoginKind>(loginKindFromUrl(saved.loginUrl));
  const [customLoginUrl, setCustomLoginUrl] = useState(
    loginKindFromUrl(saved.loginUrl) === 'custom' ? saved.loginUrl : ''
  );
  const [clientId, setClientId] = useState(saved.clientId);
  const [error, setError] = useState(initialError ?? '');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const redirectUri = getOAuthRedirectUri();

  const loginUrl =
    kind === 'production'
      ? PRODUCTION_LOGIN_URL
      : kind === 'sandbox'
        ? SANDBOX_LOGIN_URL
        : customLoginUrl;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await startOAuthLogin(clientId, loginUrl);
    } catch (cause) {
      setBusy(false);
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const copyCallback = async () => {
    await navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="slds-p-around_large">
      <article className="slds-card" style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <div className="slds-card__header slds-grid">
          <header className="slds-media slds-media_center slds-has-flexi-truncate">
            <div className="slds-media__body">
              <h2 className="slds-card__header-title">Sign in to Salesforce</h2>
              <p className="slds-text-body_small slds-m-top_x-small">
                This app is running outside Salesforce, so it needs a Connected App
                OAuth login (Authorization Code + PKCE). No client secret is stored
                in the browser.
              </p>
            </div>
          </header>
        </div>
        <div className="slds-card__body slds-card__body_inner">
          <form className="slds-form slds-form_stacked" onSubmit={event => void onSubmit(event)}>
            <div className="slds-form-element slds-m-bottom_small">
              <label className="slds-form-element__label" htmlFor="login-kind">
                Environment
              </label>
              <div className="slds-form-element__control">
                <div className="slds-select_container">
                  <select
                    id="login-kind"
                    className="slds-select"
                    value={kind}
                    onChange={event => setKind(event.target.value as LoginKind)}
                  >
                    <option value="production">Production (login.salesforce.com)</option>
                    <option value="sandbox">Sandbox (test.salesforce.com)</option>
                    <option value="custom">My Domain</option>
                  </select>
                </div>
              </div>
            </div>
            {kind === 'custom' ? (
              <div className="slds-form-element slds-m-bottom_small">
                <label className="slds-form-element__label" htmlFor="login-url">
                  My Domain login URL
                </label>
                <div className="slds-form-element__control">
                  <Input
                    id="login-url"
                    type="url"
                    required
                    placeholder="https://your-domain.my.salesforce.com"
                    value={customLoginUrl}
                    onChange={event => setCustomLoginUrl(event.target.value)}
                  />
                </div>
              </div>
            ) : null}
            <div className="slds-form-element slds-m-bottom_small">
              <label className="slds-form-element__label" htmlFor="client-id">
                Connected App Consumer Key
              </label>
              <div className="slds-form-element__control">
                <Input
                  id="client-id"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="3MVG9..."
                  value={clientId}
                  onChange={event => setClientId(event.target.value)}
                />
              </div>
            </div>
            <div className="slds-form-element slds-m-bottom_small">
              <label className="slds-form-element__label" htmlFor="redirect-uri">
                Callback URL to add on the Connected App
              </label>
              <div className="slds-form-element__control slds-grid slds-gutters_x-small">
                <div className="slds-col slds-grow">
                  <Input id="redirect-uri" readOnly value={redirectUri} />
                </div>
                <div className="slds-col slds-grow-none">
                  <Button type="button" variant="secondary" onClick={() => void copyCallback()}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
            {error ? (
              <div className="slds-scoped-notification slds-theme_error slds-m-bottom_small" role="alert">
                <pre className="slds-text-body_small" style={{ whiteSpace: 'pre-wrap' }}>
                  {error}
                </pre>
              </div>
            ) : null}
            <Button type="submit" className="slds-button_stretch" disabled={busy}>
              {busy ? 'Redirecting…' : 'Log in with Salesforce'}
            </Button>
            <div className="slds-m-top_medium slds-text-body_small">
              <h3 className="slds-text-heading_small slds-m-bottom_x-small">
                How to create the External Client App
              </h3>
              <p className="slds-m-bottom_small">
                This app runs in the browser outside Salesforce, so it needs an
                External Client App (or a Connected App) with OAuth Authorization
                Code and PKCE. No client secret is stored here.
              </p>
              <p className="slds-m-bottom_xx-small">In Setup, configure OAuth as follows:</p>
              <ul className="slds-list_dotted slds-m-bottom_small">
                <li>Enable the OAuth authorization-code flow.</li>
                <li>Add the callback URL shown above.</li>
                <li>Require PKCE.</li>
                <li>Do not require a client secret (this is a public browser app).</li>
              </ul>
              <p className="slds-m-bottom_xx-small">Select these OAuth scopes:</p>
              <ul className="slds-list_dotted slds-m-bottom_small">
                <li>
                  <code>Access the identity URL</code>
                </li>
                <li>
                  <code>Manage user data via APIs (api)</code>
                </li>
                <li>
                  <code>Perform requests at any time (refresh_token)</code>
                </li>
              </ul>
              <p>
                Adding localhost to the org CORS allowlist is not enough for the
                token endpoint. Local development already proxies that call.
              </p>
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}
