// Deletes files. Each argument is a file path or a pattern with * and ? wildcards.
// Patterns are relative to the current working directory. Unmatched paths are ignored.
// Directories are rejected; use remove-folder.mjs to delete those.
//
// Usage: node remove-files.mjs <file-or-pattern> [file-or-pattern...]
import { lstatSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expandPatterns } from './expand-globs.mjs';

export function removeFiles(patterns) {
    if (patterns.length === 0) {
        throw new Error('Usage: node remove-files.mjs <file-or-pattern> [file-or-pattern...]');
    }
    const files = new Set();
    for (const { paths } of expandPatterns(patterns)) {
        for (const path of paths) {
            let stat;
            try {
                stat = lstatSync(path);
            } catch (error) {
                if (error.code === 'ENOENT') continue;
                throw error;
            }
            if (stat.isDirectory()) {
                throw new Error(`${display(path)} is a directory. Use remove-folder.mjs to delete it.`);
            }
            files.add(path);
        }
    }
    for (const path of files) {
        rmSync(path, { force: true });
        console.log(display(path));
    }
}

function display(path) {
    const rel = relative(process.cwd(), path);
    return rel.startsWith('..') ? path : rel;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        removeFiles(process.argv.slice(2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
