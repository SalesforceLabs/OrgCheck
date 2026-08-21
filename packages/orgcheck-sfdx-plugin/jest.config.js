import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// Yarn may hoist ts-jest into a sibling workspace package instead of this
// package or the repo root. Resolve it explicitly so Jest does not look only
// relative to rootDir.
const tsJest = require.resolve('ts-jest', {
  paths: [here, join(here, '../..'), join(here, '../orgcheck-api')],
});

/** @type {import('jest').Config} */
export default {
  rootDir: here,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      tsJest,
      {
        tsconfig: join(here, 'tests/jest-tsconfig.json'),
        diagnostics: { ignoreCodes: ['TS151002'] },
      },
    ],
  },
  testMatch: ['**/tests/**/*.nut.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
