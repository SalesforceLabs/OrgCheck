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
      <article className="slds-card" style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div className="slds-card__header slds-grid">
          <header className="slds-media slds-media_center slds-has-flexi-truncate">
            <div className="slds-media__body">
              <h2 className="slds-card__header-title">Sign in to Salesforce</h2>
            </div>
          </header>
        </div>
        <div className="slds-card__body slds-card__body_inner">
          <div className="slds-grid slds-gutters slds-wrap">
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
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
                External Client App Consumer Key
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
                Callback URL to add on the External Client App
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
          </form>
            </div>
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-text-body_small">
              <h3 className="slds-text-heading_small slds-m-bottom_x-small">
                How to create the External Client App
              </h3>
              <p className="slds-m-bottom_small">
                This app runs in the browser outside Salesforce, so it needs an
                External Client App to be created in your org. You will have to 
                perform the following steps as a System Admin in your org to 
                use Org Check React application.
              </p>
              <ol className="slds-list_ordered">
                <li>As a System Admin, login to Salesforce and go to the setup menu</li>
                <li>Look for <b>External Client App Manager</b> and select this item in the Setup menu</li>
                <li>When the page is loaded, click on the <b>New External Client App</b> button </li>
                <li>A new form is loaded for that purpose</li>
                <li>In section called <b>Basic information</b>
                  <ul className="slds-list_dotted">
                    <li>Set the External Client App Name to <b>Org Check React</b></li>
                    <li>Set the Contact Email to an email address of your choice</li>
                    <li>Set the Logo Image URL to <b>https://github.com/SalesforceLabs/OrgCheck/raw/main/docs/assets/pngs/Logo+Mascot-v3.png</b></li>
                  </ul>
                </li>
                <li>In section called <b>API (Enable OAuth Settings)</b>
                  <ul className="slds-list_dotted">
                    <li>Unfold the section</li>
                    <li>Tick the <b>Enable OAuth</b> checkbox</li>
                    <li>Copy the callback URL shown above in this login screen and paste it into the <b>Callback URL</b> field</li>
                    <li>Select the following OAuth scopes:
                      <ul className="slds-list_dotted">
                        <li>Access the identity URL service</li>
                        <li>Manage user data via APIs</li>
                        <li>Perform requests at any time</li>
                      </ul>
                    </li>
                    <li>Make sure the <b>Require Proof Key for Code Exchange (PKCE)..."</b> checkbox is ticked</li>
                  </ul>
                </li>
                <li>Hit the <b>create button</b> to create the External Client App in your Salesforce organization.</li>
                <li>You will be redirected to the External Client App details page.</li>
                <li>Copy the <b>Consumer Key</b> and paste it into the <b>External Client App Consumer Key</b> field in this login screen.</li>
              </ol>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
