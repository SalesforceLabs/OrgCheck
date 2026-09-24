import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const destDir = join(root, 'public');
const dest = join(destDir, 'jsforce.min.js');
const require = createRequire(import.meta.url);

let source;
try {
  source = require.resolve('jsforce/dist/jsforce.min.js');
} catch {
  source = join(root, 'node_modules/jsforce/dist/jsforce.min.js');
}

if (!existsSync(source)) {
  throw new Error(
    `jsforce browser bundle not found at ${source}. Run npm install first.`
  );
}

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);
console.log(`Copied jsforce browser bundle to ${dest}`);
