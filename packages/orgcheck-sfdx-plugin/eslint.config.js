import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/*.cjs', 'lib/**'],
  },
  ...compat.extends(
    'eslint-config-salesforce-typescript',
    'plugin:sf-plugin/recommended',
    'eslint-config-prettier'
  ),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './test/tsconfig.json'],
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      header: 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/require-await': 'off',
      header: 'off',
    },
  },
];
