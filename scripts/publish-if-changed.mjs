// Publishes the package in the current directory when its packed files differ
// from the version already on npm. `version` and `gitHead` are ignored because
// npm rewrites them in the published tarball.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIFF_LIMIT = 40;

export function publishIfChanged({ dryRun = false } = {}) {
    const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    if (pkg.private === true) {
        throw new Error(`${pkg.name} is private. Run this from @orgcheck/api or @orgcheck/sfdx-plugin.`);
    }

    const published = publishedVersion(pkg.name);
    const temp = mkdtempSync(join(tmpdir(), 'orgcheck-publish-'));
    try {
        if (published === null) {
            console.log(`${pkg.name}@${pkg.version} is not on npm yet.`);
            publish(pkg, dryRun);
            return;
        }

        const publishedRoot = extract(
            pack(`${pkg.name}@${published}`, join(temp, 'published-pack')),
            join(temp, 'published')
        );
        const localRoot = extract(
            pack(null, join(temp, 'local-pack')),
            join(temp, 'local')
        );
        const diff = compareFingerprints(collectFiles(publishedRoot), collectFiles(localRoot));
        if (!diff.added.length && !diff.removed.length && !diff.changed.length) {
            console.log(`${pkg.name}@${pkg.version} matches the npm tarball ${pkg.name}@${published}. Skipping publish.`);
            return;
        }

        console.log(`${pkg.name}@${pkg.version} differs from the npm tarball ${pkg.name}@${published}:`);
        for (const line of describeDiff(diff)) {
            console.log(`  ${line}`);
        }
        publish(pkg, dryRun);
    } finally {
        rmSync(temp, { recursive: true, force: true });
    }
}

export function fingerprintPackageJson(contents) {
    const json = JSON.parse(contents);
    delete json.version;
    delete json.gitHead;
    return JSON.stringify(sortKeys(json));
}

export function collectFiles(root) {
    const files = new Map();
    walk(root, root, files);
    return files;
}

export function compareFingerprints(published, local) {
    const added = [];
    const removed = [];
    const changed = [];
    for (const [file, hash] of published) {
        if (!local.has(file)) {
            removed.push(file);
        } else if (local.get(file) !== hash) {
            changed.push(file);
        }
    }
    for (const file of local.keys()) {
        if (!published.has(file)) {
            added.push(file);
        }
    }
    added.sort();
    removed.sort();
    changed.sort();
    return { added, removed, changed };
}

function publish(pkg, dryRun) {
    if (dryRun) {
        console.log(`Dry run: leaving ${pkg.name} at ${pkg.version} and skipping publish.`);
        return;
    }
    assertNextTagIsFree(pkg);
    const version = run('yarn', ['version', '--patch']);
    if (version.status !== 0) {
        process.exitCode = version.status ?? 1;
        return;
    }
    const published = run('npm', ['publish', '--access', 'public', '--ignore-scripts']);
    if (published.status !== 0) {
        process.exitCode = published.status ?? 1;
    }
}

// `yarn version` commits the bump first and only then creates the git tag. If the tag already exists
// it fails after the commit, leaving a dangling bump commit. Fail early, before anything changes.
function assertNextTagIsFree(pkg) {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(pkg.version);
    if (!match) {
        return;
    }
    const next = `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
    const prefixResult = run('yarn', ['--silent', 'config', 'get', 'version-tag-prefix'], { capture: true });
    const prefix = prefixResult.status === 0 ? prefixResult.stdout.trim() : '';
    const tag = `${prefix || 'v'}${next}`;
    const existing = run('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { capture: true });
    if (existing.status === 0) {
        throw new Error(
            `Git tag ${tag} already exists, so ${pkg.name} cannot be bumped to ${next}. ` +
            `Delete or rename the stale tag, or fix the version, then run the deploy again.`
        );
    }
}

function publishedVersion(name) {
    const result = run('npm', ['view', `${name}@latest`, 'version', '--json'], { capture: true });
    if (result.status === 0) {
        const parsed = parseJsonOutput(result.stdout);
        if (typeof parsed !== 'string' || parsed.length === 0) {
            throw new Error(`Unexpected version for ${name}: ${result.stdout}`);
        }
        return parsed;
    }
    const details = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
    if (/E404|404 Not Found/.test(details)) {
        return null;
    }
    throw new Error(`Unable to read the published version of ${name}.\n${details.trim()}`);
}

function pack(spec, destination) {
    mkdirSync(destination, { recursive: true });
    const args = ['pack', '--json', '--ignore-scripts', '--pack-destination', destination];
    if (spec) {
        // Compare against the version just published, even if the user's .npmrc has min-release-age set.
        args.push('--min-release-age=0', spec);
    }
    const result = run('npm', args, { capture: true });
    if (result.status !== 0) {
        const label = spec ?? 'the local package';
        throw new Error(`npm pack failed for ${label}.\n${result.stderr ?? ''}${result.stdout ?? ''}`.trim());
    }
    const parsed = parseJsonOutput(result.stdout);
    const entry = Array.isArray(parsed) ? parsed[0] : parsed;
    const filename = entry?.filename;
    if (typeof filename !== 'string' || filename.length === 0) {
        throw new Error(`npm pack did not return a filename:\n${result.stdout}`);
    }
    const archive = join(destination, basename(filename));
    if (!existsSync(archive)) {
        throw new Error(`Packed file not found at ${archive}`);
    }
    return archive;
}

function extract(archive, destination) {
    mkdirSync(destination, { recursive: true });
    const result = run('tar', ['-xzf', archive, '-C', destination]);
    if (result.status !== 0) {
        throw new Error(`Unable to extract ${archive}`);
    }
    const root = join(destination, 'package');
    if (!existsSync(root)) {
        throw new Error(`Tarball ${archive} did not contain a package directory.`);
    }
    return root;
}

function walk(dir, root, files) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, root, files);
            continue;
        }
        if (!entry.isFile()) {
            continue;
        }
        const rel = relative(root, full).split(sep).join('/');
        const data = readFileSync(full);
        files.set(rel, rel === 'package.json' ? fingerprintPackageJson(data.toString('utf8')) : sha256(data));
    }
}

function describeDiff(diff) {
    const lines = [
        ...diff.added.map((file) => `added: ${file}`),
        ...diff.removed.map((file) => `removed: ${file}`),
        ...diff.changed.map((file) => `changed: ${file}`),
    ];
    if (lines.length <= DIFF_LIMIT) {
        return lines;
    }
    return [...lines.slice(0, DIFF_LIMIT), `... and ${lines.length - DIFF_LIMIT} more files`];
}

function sortKeys(value) {
    if (Array.isArray(value)) {
        return value.map(sortKeys);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
    }
    return value;
}

function sha256(data) {
    return createHash('sha256').update(data).digest('hex');
}

function parseJsonOutput(stdout) {
    const text = stdout.trim();
    const start = text.search(/[[{"]/);
    if (start < 0) {
        throw new Error(`No JSON in npm output:\n${text}`);
    }
    return JSON.parse(text.slice(start));
}

function run(command, args, { capture = false } = {}) {
    const result = spawnSync(command, args, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    if (result.error) {
        throw result.error;
    }
    return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        publishIfChanged({ dryRun: process.argv.includes('--dry-run') });
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
