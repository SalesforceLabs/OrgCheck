// Moves files into a folder. Every argument except the last is a file path or a
// pattern with * and ? wildcards. The last argument is the destination folder.
// The folder is created when it is missing. Fails when a pattern matches nothing.
// An existing file in the destination is replaced.
//
// Usage: node move-files.mjs <file-or-pattern> [file-or-pattern...] <destination-folder>
import { copyFileSync, lstatSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expandPatterns } from './expand-globs.mjs';

export function moveFiles(args) {
    if (args.length < 2) {
        throw new Error('Usage: node move-files.mjs <file-or-pattern> [file-or-pattern...] <destination-folder>');
    }
    const destination = resolve(args[args.length - 1]);
    const sources = collectSources(args.slice(0, -1), destination);
    mkdirSync(destination, { recursive: true });
    for (const source of sources) {
        const target = join(destination, basename(source));
        if (source === target) continue;
        moveFile(source, target);
        console.log(`${display(source)} -> ${display(target)}`);
    }
}

function collectSources(patterns, destination) {
    let destinationStat;
    try {
        destinationStat = lstatSync(destination);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    if (destinationStat && !destinationStat.isDirectory()) {
        throw new Error(`${display(destination)} is not a directory.`);
    }
    const files = new Set();
    for (const { pattern, wildcard, paths } of expandPatterns(patterns)) {
        if (wildcard && paths.length === 0) {
            throw new Error(`No files matched ${pattern}`);
        }
        if (!wildcard && paths.length === 1 && !exists(paths[0])) {
            throw new Error(`No such file: ${pattern}`);
        }
        for (const path of paths) {
            const stat = lstatSync(path);
            if (stat.isDirectory()) {
                throw new Error(`${display(path)} is a directory. This script moves files only.`);
            }
            if (path === destination) {
                throw new Error(`${display(path)} is the destination folder.`);
            }
            files.add(path);
        }
    }
    return files;
}

function exists(path) {
    try {
        lstatSync(path);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
    }
}

function moveFile(from, to) {
    if (from === to) {
        return;
    }
    try {
        const existing = lstatSync(to);
        if (existing.isDirectory()) {
            throw new Error(`${display(to)} is a directory.`);
        }
        rmSync(to, { force: true });
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    try {
        renameSync(from, to);
    } catch (error) {
        if (error.code !== 'EXDEV') throw error;
        copyFileSync(from, to);
        rmSync(from, { force: true });
    }
}

function display(path) {
    const rel = relative(process.cwd(), path);
    return rel.startsWith('..') ? path : rel;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        moveFiles(process.argv.slice(2));
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
