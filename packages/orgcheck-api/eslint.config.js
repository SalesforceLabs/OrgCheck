'use strict';

const { defineConfig, globalIgnores } = require('eslint/config');
const jsdocPlugIn = require('eslint-plugin-jsdoc');
const jestPlugIn = require('eslint-plugin-jest');

module.exports = defineConfig([
  globalIgnores([ 
    'dist/**/*.js'
  ]),
  {
    rules: {
      'no-unused-vars': [
        "warn", {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  },
  { // JSdoc plugin
    files: [
      'src/**/*.ts'
    ],
    extends: [ jsdocPlugIn.configs['flat/recommended'] ]
  },
  { // Jest plugin
    files: [ 
      'tests/bundled/*.js',
      'tests/unit/*.ts',
      'tests/utils/*.ts'
    ],
    extends: [ jestPlugIn.configs['flat/recommended'] ]
  }
]);