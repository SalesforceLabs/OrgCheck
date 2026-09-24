import '@testing-library/jest-dom/vitest';
import { formatOptions, runA11yCheck } from '@sa11y/matcher';

expect.extend({
  async toBeAccessible(received: Element | Document = document) {
    const { isAccessible, a11yError, receivedMsg } = await runA11yCheck(received);
    return {
      pass: isAccessible,
      message: () => {
        const details =
          a11yError && typeof a11yError.format === 'function'
            ? a11yError.format(formatOptions)
            : '';
        return `Expected: no accessibility violations\nReceived: ${receivedMsg}\n\n${details}`;
      },
    };
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
