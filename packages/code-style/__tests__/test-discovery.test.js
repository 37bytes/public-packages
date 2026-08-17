/**
 * @fileoverview Guard: every *.test.js file must be reachable by the "test" script globs.
 *
 * WHY the globs are explicit (not bare `node --test`):
 * Node 24 `node --test` with no args auto-discovers **\/*.test.{js,ts} recursively,
 * including fixture .test.ts files and the intentionally-red parity .check.js suite's
 * fixtures; explicit globs keep the root suite green and bounded. This guard keeps the
 * explicit globs honest — if someone adds a real test file in a location no script glob
 * covers, it would silently never run; this test fails loudly and names the orphan.
 *
 * It scans the package tree for **\/*.test.js (EXCLUDING node_modules and
 * __tests__/fixtures/**), parses package.json's "test" script to extract its globs,
 * and asserts every found file matches at least one glob.
 */

import assert from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..');
const EXCLUDED_DIRECTORIES = new Set(['node_modules']);
const EXCLUDED_PATH_PREFIXES = [path.join('__tests__', 'fixtures')];

/** Recursively collect *.test.js files relative to PACKAGE_ROOT, skipping excluded trees. */
const collectTestFiles = (directory, relativePrefix = '') => {
    const found = [];
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- directory descends from PACKAGE_ROOT, a build-time constant, not user input
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const relativePath = relativePrefix ? path.join(relativePrefix, entry.name) : entry.name;
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRECTORIES.has(entry.name)) {
                continue;
            }
            if (
                EXCLUDED_PATH_PREFIXES.some(
                    (prefix) => relativePath === prefix || relativePath.startsWith(prefix + path.sep)
                )
            ) {
                continue;
            }
            found.push(...collectTestFiles(path.join(directory, entry.name), relativePath));
        } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
            found.push(relativePath);
        }
    }
    return found;
};

/**
 * Convert a simple shell glob (supporting `*` = any run of non-separator chars) into a RegExp.
 * The three "test" script globs use only single `*` segments, so this is sufficient — no `**`.
 */
const globToRegExp = (glob) => {
    const escaped = glob
        .split('/')
        .map((segment) =>
            segment
                .split('*')
                .map((part) => part.replaceAll(/[.+?^${}()|[\]\\]/g, '\\$&'))
                .join('[^/]*')
        )
        .join('/');
    // eslint-disable-next-line security/detect-non-literal-regexp -- the pattern is derived from our own package.json globs, not user input
    return new RegExp(`^${escaped}$`);
};

/** Extract the glob arguments from the package.json "test" script (everything after `node --test`). */
const extractTestScriptGlobs = () => {
    const packageJson = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
    const testScript = packageJson.scripts?.test ?? '';
    const tokens = testScript.split(/\s+/).filter(Boolean);
    const testFlagIndex = tokens.indexOf('--test');
    assert.ok(testFlagIndex !== -1, `package.json "test" script does not invoke \`node --test\`: ${testScript}`);
    return tokens.slice(testFlagIndex + 1);
};

describe('test-script discovery guard', () => {
    const scriptGlobs = extractTestScriptGlobs();
    const globMatchers = scriptGlobs.map((glob) => globToRegExp(glob));
    const testFiles = collectTestFiles(PACKAGE_ROOT).map((filePath) => filePath.split(path.sep).join('/'));

    test('the "test" script declares at least one glob', () => {
        assert.ok(
            scriptGlobs.length > 0,
            'the "test" script has no file globs — it would fall back to recursive auto-discovery'
        );
    });

    test('no script glob contains ** (globToRegExp only handles single *)', () => {
        // globToRegExp converts * to [^/]* (no cross-separator matching). A ** in a glob would
        // be silently converted to two adjacent [^/]* terms — which matches single-level paths
        // only, not recursive paths. Any glob with ** must be expanded or rewritten.
        const doubleStarGlobs = scriptGlobs.filter((glob) => glob.includes('**'));
        assert.deepStrictEqual(
            doubleStarGlobs,
            [],
            `These "test" script globs contain ** which globToRegExp cannot handle:\n  ${doubleStarGlobs.join('\n  ')}\n` +
                'Expand them into explicit single-level globs or update globToRegExp to support **.'
        );
    });

    test('every *.test.js file is matched by a "test" script glob', () => {
        assert.ok(testFiles.length > 0, 'no *.test.js files found — collector or exclusion logic is broken');
        const orphans = testFiles.filter((filePath) => !globMatchers.some((matcher) => matcher.test(filePath)));
        assert.deepStrictEqual(
            orphans,
            [],
            `These *.test.js files are not matched by any "test" script glob and would never run:\n  ${orphans.join('\n  ')}\n` +
                `Move each to a globbed location or extend the "test" script in package.json (current globs: ${scriptGlobs.join(' ')}).`
        );
    });
});
