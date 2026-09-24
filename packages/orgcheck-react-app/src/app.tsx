import { OrgCheckProvider } from '@/context/OrgCheckContext';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routes } from '@/routes';
import { getRouterBasename } from '@/lib/paths';
import {
  completeOAuthCallback,
  homePathAfterOAuth,
  isOAuthCallbackLocation,
} from '@/lib/oauth';
import './styles/global.css';

const initialUrl = new URL(window.location.href);

async function start(): Promise<void> {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element #root was not found.');
  }

  if (isOAuthCallbackLocation(initialUrl.pathname, initialUrl.search, initialUrl.hash)) {
    root.textContent = 'Completing Salesforce login…';
    try {
      await completeOAuthCallback(initialUrl.href);
      window.location.replace(homePathAfterOAuth());
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      root.replaceChildren();
      const title = document.createElement('h2');
      title.textContent = 'Salesforce login failed';
      const error = document.createElement('pre');
      error.style.whiteSpace = 'pre-wrap';
      error.style.maxWidth = '42rem';
      error.textContent = message;
      const home = document.createElement('a');
      home.href = homePathAfterOAuth();
      home.textContent = 'Back to login';
      root.append(title, error, home);
    }
    return;
  }

  const basename = getRouterBasename();
  const router = createBrowserRouter(routes, { basename });
  createRoot(root).render(
    <StrictMode>
      <OrgCheckProvider>
        <RouterProvider router={router} />
      </OrgCheckProvider>
    </StrictMode>
  );
}

void start();
