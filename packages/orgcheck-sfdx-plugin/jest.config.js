import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('jest').Config} */
export default {
  rootDir: here,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': join(here, 'jest-esbuild-transformer.cjs'),
  },
  testMatch: ['**/tests/**/*.nut.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
