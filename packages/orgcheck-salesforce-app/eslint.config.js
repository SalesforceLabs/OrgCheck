'use strict';

const { defineConfig, globalIgnores } = require('eslint/config');
const salesforceLwcConfig = require('@salesforce/eslint-config-lwc/recommended');
const globals = require('globals');
const jsdocPlugIn = require('eslint-plugin-jsdoc');
const jestPlugIn = require('eslint-plugin-jest');

module.exports = defineConfig([
  globalIgnores([ 
    'build/libs/**/*.js', 
    'build/dist/**/*.js',
    'force-app/main/default/lwc/**/libs/*.js',
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
  { // LWC configuration for force-app/main/default/lwc
    files: [ 
      'force-app/main/default/lwc/**/*.js'
    ],
    extends: [ salesforceLwcConfig ],
  },
  { // LWC configuration with override for LWC test files
    files: [ 
      'force-app/main/default/lwc/**/__tests__/*.test.js' 
    ],
    extends: [ salesforceLwcConfig ],
    rules: {
      '@lwc/lwc/no-unexpected-wire-adapter-usages': 'off'
    },
    languageOptions: {
      globals: { ...globals.node }
    }
  },
  { // JSdoc plugin
    files: [
      'force-app/main/default/lwc/**/*.js',
    ],
    extends: [ jsdocPlugIn.configs['flat/recommended'] ]
  },
  { // Jest plugin
    files: [ 
      'force-app/main/default/lwc/**/__tests__/*.test.js',
    ],
    extends: [ jestPlugIn.configs['flat/recommended'] ]
  }
]);