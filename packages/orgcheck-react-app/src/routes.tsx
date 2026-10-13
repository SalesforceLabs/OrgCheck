import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import AppLayout from '@/appLayout';
import { NAVIGATION } from '@/lib/navigation';

const Welcome = lazy(() => import('@/pages/Welcome'));
const Cache = lazy(() => import('@/pages/Cache'));
const RecipePage = lazy(() => import('@/pages/RecipePage'));
const GlobalView = lazy(() => import('@/pages/GlobalView'));
const ObjectDescription = lazy(() => import('@/pages/ObjectDescription'));
const FieldPermissions = lazy(() => import('@/pages/FieldPermissions'));
const RoleHierarchy = lazy(() => import('@/pages/RoleHierarchy'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const OAuthCallback = lazy(() => import('@/pages/OAuthCallback'));

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
