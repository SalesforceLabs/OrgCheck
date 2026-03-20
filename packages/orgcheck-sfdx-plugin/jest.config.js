/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'test/jest-tsconfig.json',
        diagnostics: { ignoreCodes: ['TS151002'] },
      },
    ],
  },
  testMatch: ['**/test/**/*.nut.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
};
