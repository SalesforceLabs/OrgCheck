const lwcCompiler = require('@lwc/compiler');

const transformSync = lwcCompiler.transformSync;

lwcCompiler.transformSync = (source, filename, options) => transformSync(source, filename, {
    ...options,
    apiVersion: 66,
    experimentalComplexExpressions: true
});

module.exports = require('@lwc/jest-transformer');
