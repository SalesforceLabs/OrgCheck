import { render, screen } from '@testing-library/react';
import OAuthLogin from '@/components/orgcheck/OAuthLogin';

describe('orgcheck-oauth-login', () => {
  it('makes sure the component can be added in the document with no error and checks for its accessibility', async () => {
    let hadError = false;
    try {
      const { container } = render(<OAuthLogin />);
      expect(container).toBeDefined();
      expect(
        screen.getByRole('heading', { name: 'Sign in to Salesforce' })
      ).toBeInTheDocument();
      await expect(container).toBeAccessible();
    } catch (error) {
      console.error(error);
      hadError = true;
    } finally {
      expect(hadError).toBeFalsy();
    }
  });

  it('shows the Salesforce login form', () => {
    render(<OAuthLogin />);
    expect(screen.getByLabelText('Environment')).toBeInTheDocument();
    expect(screen.getByLabelText('External Client App Consumer Key')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Log in with Salesforce' })
    ).toBeInTheDocument();
  });
});
