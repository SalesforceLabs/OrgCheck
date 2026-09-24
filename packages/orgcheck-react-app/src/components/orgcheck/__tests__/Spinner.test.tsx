import { render, screen } from '@testing-library/react';
import OrgCheckSpinner from '@/components/orgcheck/Spinner';
import { createOrgCheckTestValue } from '@/test/orgcheck-test-utils';
import type { OrgCheckContextValue } from '@/context/OrgCheckContext';

const orgcheck: { value: OrgCheckContextValue } = {
  value: createOrgCheckTestValue(),
};

vi.mock('@/context/OrgCheckContext', () => ({
  useOrgCheck: () => orgcheck.value,
}));

describe('orgcheck-spinner', () => {
  beforeEach(() => {
    orgcheck.value = createOrgCheckTestValue();
  });

  it('makes sure the component can be added in the document with no error and checks for its accessibility', async () => {
    let hadError = false;
    try {
      orgcheck.value = createOrgCheckTestValue({
        spinner: {
          isOpen: true,
          isClosable: false,
          hadError: false,
          waitingTime: 12,
          inProgressMessage: 'We have currently 1 process(es) in progress and 0 process(es) completed...',
          inProgressPercentage: 0,
          sections: [
            {
              id: 'objects',
              status: 'in-progress',
              label: 'Starting...',
              showInterruptButton: false,
              isInterrupted: false,
            },
          ],
        },
      });
      const { container } = render(<OrgCheckSpinner />);
      expect(container).toBeDefined();
      expect(
        screen.getByRole('dialog', { name: /Org Check is spinning around/ })
      ).toBeInTheDocument();
      await expect(container).toBeAccessible();
    } catch (error) {
      console.error(error);
      hadError = true;
    } finally {
      expect(hadError).toBeFalsy();
    }
  });

  it('makes sure the spinner is invisible by default', () => {
    const { container } = render(<OrgCheckSpinner />);
    expect(container).toBeEmptyDOMElement();
  });
});
