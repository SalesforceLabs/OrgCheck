import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { ChevronDown, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrgCheckSpinner from '@/components/orgcheck/Spinner';
import OrgCheckModal from '@/components/orgcheck/Modal';
import GlobalFilters from '@/components/orgcheck/GlobalFilters';
import TermsAcceptance from '@/components/orgcheck/TermsAcceptance';
import OAuthLogin from '@/components/orgcheck/OAuthLogin';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { NAVIGATION, findPageByPath } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import logoUrl from '@/assets/orgcheck/Logo.svg';

export default function AppLayout() {
  const location = useLocation();
  const {
    version,
    salesforceApiVersion,
    isLoading,
    usage,
    orgInformation,
    orgLimit,
    refreshCurrentPage,
    needsAuth,
    authSource,
    logout,
    initializing,
    recipeTitles,
  } = useOrgCheck();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAVIGATION.map(section => [section.key, true]))
  );
  const current = findPageByPath(location.pathname);
  const titles = recipeTitles;
  const pageTitle = current
    ? (current.recipe && titles?.get(current.recipe)) || current.label
    : 'Org Check';
  const isCallback = /\/(orgcheck-login|oauth\/callback)$/.test(
    location.pathname.replace(/\/+$/, '')
  );

  const sections = useMemo(() => {
    const term = search.toLowerCase();
    return NAVIGATION.map(section => {
      const label = section.title;
      const pages = section.pages.filter(page => {
        const pageLabel = (page.recipe && titles?.get(page.recipe)) || page.label;
        return (
          !term ||
          pageLabel.toLowerCase().includes(term) ||
          label.toLowerCase().includes(term)
        );
      });
      return {
        ...section,
        pages: pages.map(page => ({
          ...page,
          label: (page.recipe && titles?.get(page.recipe)) || page.label,
        })),
        expanded: Boolean(expanded[section.key]) || Boolean(term && pages.length > 0),
      };
    }).filter(section => section.pages.length > 0);
  }, [expanded, search, titles]);

  return (
    <div className="orgcheck-shell">
      <div className="slds-global-header_container">
        <header className="slds-global-header slds-grid slds-grid_align-spread">
          <div className="slds-global-header__item">
            <div className="slds-global-header__logo">
              <Link to="/" title="Org Check">
                <img src={logoUrl} alt="Org Check" />
              </Link>
            </div>
          </div>
          <ul className="slds-global-header__item slds-grid slds-grid_vertical-align-center">
            {orgInformation.name ? (
              <li className="slds-m-right_x-small">
                <span className="slds-badge">{orgInformation.name}</span>
              </li>
            ) : null}
            {orgInformation.type ? (
              <li className="slds-m-right_x-small">
                <span
                  className={cn(
                    'slds-badge',
                    orgInformation.theme === 'production'
                      ? 'slds-theme_error'
                      : orgInformation.theme === 'sandbox'
                        ? 'slds-theme_warning'
                        : 'slds-theme_success'
                  )}
                >
                  {orgInformation.type}
                </span>
              </li>
            ) : null}
            {orgLimit.hasInformation ? (
              <li className="slds-m-right_x-small">
                <span
                  className={cn(
                    'slds-badge',
                    orgLimit.theme === 'success'
                      ? 'slds-theme_success'
                      : orgLimit.theme === 'warning'
                        ? 'slds-theme_warning'
                        : 'slds-theme_error'
                  )}
                >
                  {orgLimit.usage}
                </span>
              </li>
            ) : null}
            {authSource === 'oauth' ? (
              <li>
                <button
                  type="button"
                  className="slds-button slds-button_neutral"
                  onClick={() => void logout()}
                >
                  Log out
                </button>
              </li>
            ) : null}
          </ul>
        </header>
      </div>

      <div className="slds-context-bar">
        <div className="slds-context-bar__primary">
          <div className="slds-context-bar__item slds-no-hover">
            <span className="slds-context-bar__label-action slds-context-bar__app-name">
              <span className="slds-truncate" title="Org Check">
                Org Check
              </span>
            </span>
          </div>
        </div>
        <nav className="slds-context-bar__secondary" role="navigation" aria-label="App">
          <ul className="slds-grid">
            <li
              className={cn(
                'slds-context-bar__item',
                location.pathname === '/' && 'slds-is-active'
              )}
            >
              <Link
                to="/"
                className="slds-context-bar__label-action"
                title="Home"
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                <span className="slds-truncate">Home</span>
              </Link>
            </li>
            {current && current.path !== '/' ? (
              <li className="slds-context-bar__item slds-is-active">
                <span className="slds-context-bar__label-action" title={pageTitle}>
                  <span className="slds-truncate">{pageTitle}</span>
                </span>
              </li>
            ) : null}
          </ul>
        </nav>
        <div className="slds-context-bar__tertiary slds-grid slds-grid_vertical-align-center slds-p-right_small">
          {version || salesforceApiVersion ? (
            <span className="slds-text-body_small slds-text-color_weak">
              {version || 'Org Check'}
              {salesforceApiVersion ? ` · API v${salesforceApiVersion}.0` : ''}
              {isLoading ? ' · Loading…' : ''}
            </span>
          ) : null}
        </div>
      </div>

      {usage.manuallyAccepted ? (
        <div
          className="slds-notify slds-notify_alert slds-alert_success slds-theme_success"
          role="status"
        >
          <span className="slds-assistive-text">Success</span>
          Using Org Check in this Salesforce organization has been confirmed by you.
        </div>
      ) : null}
      {usage.needConfirmation ? (
        <div
          className="slds-notify slds-notify_alert slds-alert_warning slds-theme_warning"
          role="status"
        >
          <span className="slds-assistive-text">Warning</span>
          Using Org Check in this Salesforce organization needs your confirmation.
        </div>
      ) : null}

      <OrgCheckSpinner />
      <OrgCheckModal />

      {isCallback ? (
        <Outlet />
      ) : needsAuth ? (
        <div className="orgcheck-workspace slds-brand-band slds-brand-band_cover slds-brand-band_medium slds-template_default">
          <OAuthLogin />
        </div>
      ) : initializing ? (
        <div className="orgcheck-workspace slds-brand-band slds-brand-band_cover slds-brand-band_medium slds-template_default" />
      ) : (
        <div className="orgcheck-workspace slds-brand-band slds-brand-band_cover slds-brand-band_medium slds-template_default">
          <TermsAcceptance />
          {orgInformation.hasApiAccessControlIssue ? (
            <section className="slds-card slds-theme_error slds-m-bottom_medium">
              <div className="slds-card__header slds-grid">
                <h2 className="slds-card__header-title">
                  How to solve the API Access Control issue...
                </h2>
              </div>
              <div className="slds-card__body slds-card__body_inner">
                Org Check is currently not working because the API Access Control
                setting is activated in this org.
              </div>
            </section>
          ) : null}
          {usage.accepted ? (
            <div className="slds-grid slds-gutters_direct orgcheck-body">
              <aside className="slds-col orgcheck-nav-pane">
                <div className="slds-form-element slds-m-bottom_small orgcheck-nav-pane__search">
                  <label
                    className="slds-form-element__label slds-assistive-text"
                    htmlFor="orgcheck-nav-search"
                  >
                    Search navigation
                  </label>
                  <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                    <Search
                      className="slds-icon slds-input__icon slds-input__icon_left slds-icon-text-default"
                      aria-hidden="true"
                      width={16}
                      height={16}
                    />
                    <Input
                      id="orgcheck-nav-search"
                      type="search"
                      placeholder="Search this list..."
                      aria-label="Search navigation"
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                    />
                  </div>
                </div>
                <nav
                  className="slds-nav-vertical slds-nav-vertical_shade orgcheck-nav-pane__list"
                  aria-label="Org Check"
                >
                  {sections.map(section => (
                    <div key={section.key} className="slds-nav-vertical__section">
                      <h2 className="slds-nav-vertical__title">
                        <button
                          type="button"
                          className="slds-button slds-button_reset orgcheck-nav-section-toggle"
                          aria-expanded={Boolean(section.expanded)}
                          onClick={() =>
                            setExpanded(currentExpanded => ({
                              ...currentExpanded,
                              [section.key]: !currentExpanded[section.key],
                            }))
                          }
                        >
                          {section.expanded ? (
                            <ChevronDown width={14} height={14} aria-hidden="true" />
                          ) : (
                            <ChevronRight width={14} height={14} aria-hidden="true" />
                          )}
                          <span>{section.title}</span>
                        </button>
                      </h2>
                      {section.expanded ? (
                        <ul>
                          {section.pages.map(page => (
                            <li
                              key={page.key}
                              className={cn(
                                'slds-nav-vertical__item',
                                location.pathname === page.path && 'slds-is-active'
                              )}
                            >
                              <Link
                                className="slds-nav-vertical__action"
                                to={page.path}
                                aria-current={
                                  location.pathname === page.path ? 'page' : undefined
                                }
                              >
                                {page.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </nav>
              </aside>
              <main className="slds-col orgcheck-content-pane">
                <div className="slds-page-header">
                  <div className="slds-page-header__row">
                    <div className="slds-page-header__col-title">
                      <div className="slds-media">
                        <div className="slds-media__body">
                          <div className="slds-page-header__name">
                            <div className="slds-page-header__name-title">
                              <h1>
                                <span
                                  className="slds-page-header__title slds-truncate"
                                  title={pageTitle}
                                >
                                  {pageTitle}
                                </span>
                              </h1>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                      <div className="slds-page-header__controls">
                        {current?.refreshButtonVisible !== false ? (
                          <div className="slds-page-header__control">
                            <Button
                              variant="secondary"
                              title="Refresh the current data being displayed"
                              onClick={() => void refreshCurrentPage()}
                            >
                              <RefreshCw width={14} height={14} />
                              Refresh
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="slds-page-header__row">
                    <div className="orgcheck-page-header-filters">
                      <GlobalFilters />
                    </div>
                  </div>
                </div>
                <article className="slds-card slds-m-top_small">
                  <div className="slds-card__body slds-card__body_inner">
                    <Outlet />
                  </div>
                </article>
              </main>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
