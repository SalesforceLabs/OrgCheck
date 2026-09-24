# Org Check React App

Standalone React rebuild of Org Check (`packages/orgcheck-react-app`). The original Lightning Web Component app still lives in `packages/orgcheck-salesforce-app/force-app/main/default`.

## Run locally

From this package:

```bash
cd packages/orgcheck-react-app
npm install
npm run dev
```

From the repository root:

```bash
npm run dev --prefix packages/orgcheck-react-app
```

The UI uses **SLDS 2 Cosmos** (`@salesforce-ux/design-system-2` unscoped `slds2.cosmos.css`) so the page gets Lightning Experience chrome: global header, context bar, brand band, page header, vertical navigation, cards, and native `slds-select` / `slds-table` blueprints. Remaining shadcn pieces consume `--slds-g-*` styling hooks.

`npm run dev` and `npm run build` copy the full jsforce browser bundle (including Tooling and Metadata APIs) from `node_modules` into `public/jsforce.min.js` (the Org Check API expects `globalThis.jsforce`).

When the app runs **outside Salesforce** (local Vite), there is no session Id. The UI then shows a Salesforce OAuth login (Authorization Code + PKCE). Create an External Client App (or Connected App) with:

- Callback URL: `https://localhost:5173/orgcheck-login` (copy the exact URL from the login card). You can also add `https://localhost:5173/oauth/callback` if that was previously registered.
- OAuth scopes: `api`, `id` / identity URL, `refresh_token`
- Authorization Code flow enabled, PKCE required
- Do **not** require a client secret for the web-server / authorization-code flow (this is a public browser client)

A browser `Failed to fetch` after Salesforce login is almost always CORS: Salesforce will not let `https://localhost:5173` call `/services/oauth2/token` directly, and the org CORS allowlist does not reliably enable that OAuth endpoint. Local `npm run dev` proxies the token exchange through Vite so the browser stays same-origin.

Local `npm run dev` and `npm run preview` serve over HTTPS (`https://localhost:5173`). The first visit uses a Vite-generated certificate; accept the browser warning once. Add that same HTTPS callback URL on the External Client App.

You can also set `VITE_SF_CLIENT_ID` as the default Consumer Key, or skip the login form with `VITE_SF_ACCESS_TOKEN` **and** `VITE_SF_INSTANCE_URL`.

## Deploy notes

Salesforce UIBundle metadata for this app lives under `salesforce/` and `orgcheckapp.uibundle-meta.xml`. UIBundle metadata must be deployed with API 67.0+. Pair this bundle with the Custom Application in `salesforce/applications/orgcheckapp.app-meta.xml` (`uiBundle` = `OrgCheck__orgcheckapp`) when you are ready to deploy it to an org.
