const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');
const setupFilesAfterEnv = jestConfig.setupFilesAfterEnv || [];
setupFilesAfterEnv.push('<rootDir>/jest-sa11y-setup.js');
module.exports = {
    ...jestConfig,
    setupFilesAfterEnv,
    transform: {
        ...jestConfig.transform,
        '^.+\\.(js|ts|html|css)$': '<rootDir>/jest-lwc-transformer.js'
    },
    testTimeout: 10000
};