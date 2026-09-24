import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { OrgCheckProvider } from '@/context/OrgCheckContext';
import { routes } from '@/routes';

vi.mock('@orgcheck/api', () => {
  const Recipes = new Proxy(
    {},
    {
      get: (_target, property) => String(property),
    }
  );
  return { Recipes };
});

vi.mock('@/lib/orgcheck-bootstrap', () => ({
  createOrgCheckApi: vi.fn(),
  Rules: new Map(),
}));

vi.mock('@/lib/session', () => ({
  resolveSalesforceSession: vi.fn().mockResolvedValue(undefined),
}));

describe('orgcheck-react-app', () => {
  it('makes sure the app can be added in the document with no error and checks for its accessibility', async () => {
    let hadError = false;
    try {
      const router = createMemoryRouter(routes, { initialEntries: ['/'] });
      const { container } = render(
        <OrgCheckProvider>
          <RouterProvider router={router} />
        </OrgCheckProvider>
      );

      expect(container).toBeDefined();
      expect(
        await screen.findByRole('heading', { name: 'Sign in to Salesforce' })
      ).toBeInTheDocument();

      await expect(container).toBeAccessible();
    } catch (error) {
      console.error(error);
      hadError = true;
    } finally {
      expect(hadError).toBeFalsy();
    }
  });
});
