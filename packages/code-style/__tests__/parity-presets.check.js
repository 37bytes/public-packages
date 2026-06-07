/**
 * @fileoverview Layer 2 parity: run all three linters over per-preset mini-projects,
 * canonicalize rule ids via rule-equivalence, compare per-file rule sets.
 * EXPECTED RED until the drift-fix plan lands (fixtures intentionally trigger
 * every fixture-expressible audit finding).
 *
 * Known-gaps entries are used for set-diff filtering regardless of their `tools` scope
 * array. The `tools` field exists for Layer 1's forward-check scoping only. In Layer 2
 * we compare canonical eslint rule names across all tools simultaneously; a gap on
 * either tool side breaks set equality, so we suppress it unconditionally.
 */
import assert from 'node:assert';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { ESLint } from 'eslint';

import { nextjs, nodejsRuntime, nodejsTool, spa, testingConfig } from '../eslint/index.js';
import { knownGaps } from './parity/known-gaps.js';
import { reverseToEslint } from './parity/rule-equivalence.js';

const exec = promisify(execFile);
const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..');
const PARITY_FIXTURES = path.join(PACKAGE_ROOT, '__tests__', 'fixtures', 'parity');

const fixtureTypeScriptOverride = {
    files: ['__tests__/fixtures/parity/**/*.ts', '__tests__/fixtures/parity/**/*.tsx'],
    languageOptions: {
        parserOptions: {
            project: path.join(PARITY_FIXTURES, 'tsconfig.json'),
            tsconfigRootDir: PARITY_FIXTURES
        }
    }
};

const MINI_PROJECTS = [
    { name: 'spa', preset: spa, directory: 'spa' },
    { name: 'nextjs', preset: nextjs, directory: 'nextjs' },
    { name: 'nodejs-runtime', preset: nodejsRuntime, directory: 'nodejs-runtime' },
    { name: 'nodejs-tool', preset: nodejsTool, directory: 'nodejs-tool' }
];

const runEslint = async (preset, directory) => {
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [...preset, testingConfig, fixtureTypeScriptOverride],
        cwd: PACKAGE_ROOT
    });
    const results = await eslint.lintFiles([path.join(PARITY_FIXTURES, directory, '**/*.{ts,tsx,js}')]);
    const rulesByFile = new Map();
    for (const result of results) {
        const relative = path.relative(PARITY_FIXTURES, result.filePath);
        rulesByFile.set(relative, new Set(result.messages.map((message) => message.ruleId).filter(Boolean)));
    }
    return rulesByFile;
};

/**
 * Parse an oxlint diagnostic `code` field into the oxlint-internal rule namespace.
 *
 * Real shapes observed (oxlint 1.61.0):
 *   "eslint(no-self-compare)"                         -> "no-self-compare"
 *   "eslint-plugin-unicorn(prefer-node-protocol)"     -> "unicorn/prefer-node-protocol"
 *   "eslint-plugin-import(no-default-export)"         -> "import/no-default-export"
 *   "eslint-plugin-react(jsx-handler-names)"          -> "react/jsx-handler-names"
 *   "eslint-plugin-jest(no-focused-tests)"            -> "jest/no-focused-tests"
 *   "eslint-plugin-next(google-font-display)"         -> "nextjs/google-font-display"
 *   "sonarjs(no-redundant-jump)"                      -> "sonarjs/no-redundant-jump"
 *   "storybook(meta-satisfies-type)"                  -> "storybook/meta-satisfies-type"
 *   "@37bytes/enum-pattern(enum-pattern)"             -> "@37bytes/enum-pattern"
 *
 * The plan's original `.replace(/^eslint\(|\)$/g, '').replace('eslint-plugin-', '')` was a guess
 * that would have produced "unicorn(prefer-node-protocol)" or "import(first)" — wrong namespace.
 * This function handles all observed formats.
 *
 * Any code that matches none of the known shapes is recorded in unknownOxlintCodeFormats
 * (asserted-empty per mini-project below) instead of silently shrinking coverage: an
 * unrecognized format would otherwise be returned as-is, fail reverseToEslint, get skipped,
 * and quietly drop a real drift finding.
 */
const unknownOxlintCodeFormats = new Set();

const parseOxlintCode = (code) => {
    // @scope/plugin(rule) — e.g. "@37bytes/enum-pattern(enum-pattern)"
    const scopedMatch = code.match(/^(@[^/]+\/[^(]+)\(([^)]+)\)$/);
    if (scopedMatch) {
        // Reconstruct as @scope/rule — the rule part is the same as plugin name when they share it
        // e.g. "@37bytes/enum-pattern(enum-pattern)" -> "@37bytes/enum-pattern"
        const pluginPath = scopedMatch[1]; // "@37bytes/enum-pattern"
        const ruleName = scopedMatch[2]; // "enum-pattern"
        // If plugin already ends with /ruleName, use the plugin path directly
        if (pluginPath.endsWith(`/${ruleName}`)) {
            return pluginPath; // "@37bytes/enum-pattern"
        }
        return `${pluginPath}/${ruleName}`;
    }

    // eslint-plugin-next(rule) — oxlint <= 1.67 used this format
    // next(rule) — oxlint >= 1.68.0 uses this shorter format (code prefix change)
    // Both map to the "nextjs/" namespace used in our oxlint config.
    const nextPluginMatch = code.match(/^(?:eslint-plugin-next|next)\((.+)\)$/);
    if (nextPluginMatch) {
        return `nextjs/${nextPluginMatch[1]}`;
    }

    // eslint-plugin-jest(rule) — oxlint uses "jest/" namespace (maps to vitest/ in eslint)
    const jestPluginMatch = code.match(/^eslint-plugin-jest\((.+)\)$/);
    if (jestPluginMatch) {
        return `jest/${jestPluginMatch[1]}`;
    }

    // eslint-plugin-X(rule) — e.g. "eslint-plugin-unicorn(prefer-node-protocol)"
    const namedPluginMatch = code.match(/^eslint-plugin-([^(]+)\((.+)\)$/);
    if (namedPluginMatch) {
        return `${namedPluginMatch[1]}/${namedPluginMatch[2]}`;
    }

    // typescript-eslint(rule) — oxlint 1.61+ emits this format for TypeScript rules;
    // maps to the same "typescript/" prefix used by other oxlint TypeScript rule codes.
    // e.g. "typescript-eslint(array-type)" -> "typescript/array-type"
    const typescriptEslintMatch = code.match(/^typescript-eslint\((.+)\)$/);
    if (typescriptEslintMatch) {
        return `typescript/${typescriptEslintMatch[1]}`;
    }

    // sonarjs(rule), storybook(rule), etc. — bare plugin name without "eslint-plugin-" prefix
    const barePluginMatch = code.match(/^([a-z][a-z0-9-]*)\((.+)\)$/);
    if (barePluginMatch && barePluginMatch[1] !== 'eslint') {
        return `${barePluginMatch[1]}/${barePluginMatch[2]}`;
    }

    // eslint(rule) — core eslint rule
    const coreMatch = code.match(/^eslint\((.+)\)$/);
    if (coreMatch) {
        return coreMatch[1];
    }

    // Unrecognized format: record it so an auxiliary test fails loudly. Returning it
    // as-is would let reverseToEslint reject it and silently drop a drift finding.
    unknownOxlintCodeFormats.add(code);
    return code;
};

const runOxlint = async (directory) => {
    let stdout;
    try {
        ({ stdout } = await exec(
            path.join(PACKAGE_ROOT, 'node_modules', '.bin', 'oxlint'),
            ['--format', 'json', path.join(PARITY_FIXTURES, directory)],
            { cwd: PACKAGE_ROOT }
        ));
    } catch (executionError) {
        stdout = executionError.stdout;
    }
    let report;
    try {
        report = JSON.parse(stdout);
    } catch (parseError) {
        throw new Error(
            `oxlint JSON parse failed: ${parseError.message}\nraw stdout (first 500 chars): ${String(stdout).slice(0, 500)}`
        );
    }
    const rulesByFile = new Map();
    for (const diagnostic of report.diagnostics ?? []) {
        const relative = path.relative(PARITY_FIXTURES, path.resolve(PACKAGE_ROOT, diagnostic.filename));
        const oxlintRule = parseOxlintCode(diagnostic.code);
        const canonical = reverseToEslint('oxlint', oxlintRule);
        if (!canonical) {
            continue;
        } // tool-only rule firing — Layer 1 reverse check owns this class
        if (!rulesByFile.has(relative)) {
            rulesByFile.set(relative, new Set());
        }
        rulesByFile.get(relative).add(canonical);
    }
    return rulesByFile;
};

const runBiome = async (directory) => {
    let stdout;
    try {
        ({ stdout } = await exec(
            path.join(PACKAGE_ROOT, 'node_modules', '.bin', 'biome'),
            [
                'lint',
                '--config-path',
                path.join(PACKAGE_ROOT, 'biome', 'config.json'),
                '--reporter',
                'json',
                path.join(PARITY_FIXTURES, directory)
            ],
            { cwd: PACKAGE_ROOT }
        ));
    } catch (executionError) {
        stdout = executionError.stdout;
    }
    let report;
    try {
        report = JSON.parse(stdout);
    } catch (parseError) {
        // biome explicitly warns its JSON reporter shape is unstable between patch releases.
        throw new Error(
            `biome JSON parse failed: ${parseError.message}\nraw stdout (first 500 chars): ${String(stdout).slice(0, 500)}`
        );
    }
    const rulesByFile = new Map();
    for (const diagnostic of report.diagnostics ?? []) {
        // biome location.path is a plain string (relative to cwd), NOT an object with a .file property
        const locationPath = diagnostic.location?.path;
        if (!locationPath) {
            continue;
        }
        const relative = path.relative(PARITY_FIXTURES, path.resolve(PACKAGE_ROOT, locationPath));
        // category format: "lint/suspicious/noConsole"
        const category = diagnostic.category ?? '';
        const match = category.match(/^lint\/(\w+)\/(\w+)$/);
        if (!match) {
            continue;
        }
        const canonical = reverseToEslint('biome', `${match[1]}/${match[2]}`);
        if (!canonical) {
            continue;
        }
        if (!rulesByFile.has(relative)) {
            rulesByFile.set(relative, new Set());
        }
        rulesByFile.get(relative).add(canonical);
    }
    return rulesByFile;
};

/**
 * Diff two sets of canonical eslint rule names, suppressing known gaps.
 * Note: known-gaps entries are filtered unconditionally regardless of their `tools` scope.
 * The `tools` field is a Layer 1 concept (forward-check scoping). In Layer 2, a gap on
 * either side breaks set equality, so we always suppress it.
 */
/**
 * Await a runner promise, re-throwing any failure tagged with the runner name so a
 * rejection in the shared before-hook points at which linter crashed (eslint/oxlint/biome).
 */
const withRunnerName = async (name, runnerPromise) => {
    try {
        return await runnerPromise;
    } catch (error) {
        throw new Error(`${name} runner failed: ${error.message}`);
    }
};

const diffSets = (leftName, leftSet, rightName, rightSet) => {
    // Sort both arrays so the failure text is deterministic across runs (Set iteration order
    // is insertion order, which varies with diagnostic emission order). Stable text lets
    // fix-phase tooling diff baselines reliably.
    const onlyLeft = [...leftSet].filter((ruleName) => !rightSet.has(ruleName) && !knownGaps[ruleName]).toSorted();
    const onlyRight = [...rightSet].filter((ruleName) => !leftSet.has(ruleName) && !knownGaps[ruleName]).toSorted();
    const lines = [];
    if (onlyLeft.length > 0) {
        lines.push(`only ${leftName}: ${onlyLeft.join(', ')}`);
    }
    if (onlyRight.length > 0) {
        lines.push(`only ${rightName}: ${onlyRight.join(', ')}`);
    }
    return lines;
};

for (const project of MINI_PROJECTS) {
    describe(`preset parity: ${project.name}`, () => {
        let eslintByFile;
        let oxlintByFile;
        let biomeByFile;
        before(async () => {
            [eslintByFile, oxlintByFile, biomeByFile] = await Promise.all([
                withRunnerName('eslint', runEslint(project.preset, project.directory)),
                withRunnerName('oxlint', runOxlint(project.directory)),
                withRunnerName('biome', runBiome(project.directory))
            ]);
        });
        test(`eslint produced results for ${project.name}`, () => {
            assert.ok(eslintByFile.size > 0, `no eslint results for ${project.directory} — glob or cwd problem`);
        });
        test(`oxlint code formats all recognized for ${project.name}`, () => {
            // unknownOxlintCodeFormats is module-scoped and accumulates across all mini-projects'
            // runOxlint calls (which finished in the shared before-hook). Asserting it empty here
            // catches any oxlint code shape parseOxlintCode does not yet handle.
            assert.strictEqual(
                unknownOxlintCodeFormats.size,
                0,
                `unrecognized oxlint code format(s): ${[...unknownOxlintCodeFormats].toSorted().join(', ')} — extend parseOxlintCode`
            );
        });
        test(`oxlint verdict parity for ${project.name}`, () => {
            const failures = [];
            for (const [file, eslintRules] of eslintByFile) {
                const oxlintRules = oxlintByFile.get(file) ?? new Set();
                failures.push(
                    ...diffSets('eslint', eslintRules, 'oxlint', oxlintRules).map((line) => `${file}: ${line}`)
                );
            }
            assert.strictEqual(failures.length, 0, `eslint vs oxlint drift:\n${failures.join('\n')}`);
        });
        test(`biome verdict parity for ${project.name}`, () => {
            const failures = [];
            for (const [file, eslintRules] of eslintByFile) {
                const biomeRules = biomeByFile.get(file) ?? new Set();
                failures.push(
                    ...diffSets('eslint', eslintRules, 'biome', biomeRules).map((line) => `${file}: ${line}`)
                );
            }
            assert.strictEqual(failures.length, 0, `eslint vs biome drift:\n${failures.join('\n')}`);
        });
    });
}
