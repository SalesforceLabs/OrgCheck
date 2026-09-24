import type { RouteObject } from 'react-router';
import AppLayout from '@/appLayout';
import Welcome from '@/pages/Welcome';
import Cache from '@/pages/Cache';
import RecipePage from '@/pages/RecipePage';
import GlobalView from '@/pages/GlobalView';
import ObjectDescription from '@/pages/ObjectDescription';
import FieldPermissions from '@/pages/FieldPermissions';
import RoleHierarchy from '@/pages/RoleHierarchy';
import NotFound from '@/pages/NotFound';
import OAuthCallback from '@/pages/OAuthCallback';
import { NAVIGATION } from '@/lib/navigation';

function pageElement(kind: string) {
  switch (kind) {
    case 'welcome':
      return <Welcome />;
    case 'cache':
      return <Cache />;
    case 'global-view':
      return <GlobalView />;
    case 'object':
      return <ObjectDescription />;
    case 'field-permissions':
      return <FieldPermissions />;
    case 'role-hierarchy':
      return <RoleHierarchy />;
    default:
      return <RecipePage />;
  }
}

const children: RouteObject[] = NAVIGATION.flatMap(section =>
  section.pages.map(page =>
    page.path === '/'
      ? {
          index: true,
          element: pageElement(page.kind),
          handle: { showInNavigation: true, label: page.label, section: section.title },
        }
      : {
          path: page.path.replace(/^\//, ''),
          element: pageElement(page.kind),
          handle: { showInNavigation: true, label: page.label, section: section.title },
        }
  )
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      ...children,
      {
        path: 'orgcheck-login',
        element: <OAuthCallback />,
      },
      {
        path: 'oauth/callback',
        element: <OAuthCallback />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
