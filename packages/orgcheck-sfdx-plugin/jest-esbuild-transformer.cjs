const { transformSync } = require('esbuild');

module.exports = {
  process(sourceText, sourcePath) {
    const result = transformSync(sourceText, {
      loader: sourcePath.endsWith('x') ? 'tsx' : 'ts',
      format: 'cjs',
      target: 'node18',
      sourcemap: 'inline',
      sourcefile: sourcePath,
    });
    return { code: result.code };
  },
};
