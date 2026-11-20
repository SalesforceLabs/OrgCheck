// Deletes each named folder, including files and folders inside it.
// Missing folders are ignored. A path that is a file is rejected.
// A symbolic link is removed without following it.
//
// Usage: node remove-folder.mjs <folder> [folder...]
import { lstatSync, rmSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function removeFolders(names) {
    if (names.length === 0) {
        throw new Error('Usage: node remove-folder.mjs <folder> [folder...]');
    }
    const targets = names.map((name) => {
        const path = resolve(name);
        let stat;
        try {
            stat = lstatSync(path);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
        if (stat && !stat.isSymbolicLink() && !stat.isDirectory()) {
            throw new Error(`${display(path)} is not a directory.`);
        }
        return { path, stat };
    });
    for (const { path, stat } of targets) {
        if (!stat) continue;
        if (stat.isSymbolicLink()) {
            rmSync(path, { force: true });
        } else {
            rmSync(path, { recursive: true, force: true });
        }
        console.log(display(path));
    }
}

function display(path) {
    const rel = relative(process.cwd(), path);
    return rel.startsWith('..') ? path : rel;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        removeFolders(process.argv.slice(2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
