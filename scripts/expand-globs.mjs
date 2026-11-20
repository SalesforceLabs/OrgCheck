// Expands path arguments that may contain * and ? wildcards.
// * and ? apply to a single path segment and do not match a leading dot.
import { readdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const WILDCARD = /[*?]/;

function escapeRegExp(char) {
    return /[.+^${}()|[\]\\]/.test(char) ? `\\${char}` : char;
}

function matchesSegment(name, segment) {
    if (!segment.startsWith('.') && name.startsWith('.')) {
        return false;
    }
    let source = '^';
    for (const char of segment) {
        if (char === '*') source += '.*';
        else if (char === '?') source += '.';
        else source += escapeRegExp(char);
    }
    source += '$';
    return new RegExp(source).test(name);
}

function patternRoot(pattern) {
    const normalized = pattern.replace(/\\/g, '/');
    const drive = normalized.match(/^([A-Za-z]:)(\/|$)/);
    if (drive) {
        const segments = normalized.slice(drive[1].length).split('/').filter((part) => part.length > 0);
        return { root: drive[1] + sep, segments };
    }
    if (normalized.startsWith('/')) {
        return {
            root: sep,
            segments: normalized.split('/').filter((part) => part.length > 0),
        };
    }
    return {
        root: process.cwd(),
        segments: normalized.split('/').filter((part) => part.length > 0),
    };
}

export function expandPattern(pattern) {
    if (!WILDCARD.test(pattern)) {
        return [resolve(pattern)];
    }
    const { root, segments } = patternRoot(pattern);
    if (segments.length === 0) {
        return [];
    }
    let current = [root];
    for (const segment of segments) {
        const next = [];
        for (const dir of current) {
            if (!WILDCARD.test(segment)) {
                next.push(join(dir, segment));
                continue;
            }
            let entries;
            try {
                entries = readdirSync(dir);
            } catch {
                continue;
            }
            for (const entry of entries) {
                if (matchesSegment(entry, segment)) {
                    next.push(join(dir, entry));
                }
            }
        }
        current = next;
    }
    return current.map((path) => resolve(path));
}

export function expandPatterns(patterns) {
    return patterns.map((pattern) => ({
        pattern,
        wildcard: WILDCARD.test(pattern),
        paths: expandPattern(pattern),
    }));
}
