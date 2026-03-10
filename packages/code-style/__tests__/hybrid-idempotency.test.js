/**
 * @fileoverview Hybrid idempotency tests (Roadmap §2.4)
 *
 * Verifies that hybrid linting setups (OxLint+ESLint, Biome+ESLint)
 * produce the same results as pure ESLint. Catches rules that "fall
 * through the cracks" — disabled by the bridge but not covered by
 * the fast tool.
 *
 * Test formula:
 *   ESLint(fixture) == Tool(fixture) ∪ ESLint_hybrid(fixture)
 *
 * CWD is set to project ROOT so that file paths like
 * `__tests__/fixtures/fixture-invalid.tsx` match ESLint testingConfig
 * patterns (`**\/__tests__/**\/*`) — same as in a real project.
 */

import assert from 'node:assert';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { before, describe, test } from 'node:test';
import { promisify } from 'node:util';

import { ESLint } from 'eslint';
import biomeConfig from 'eslint-config-biome';
import oxlintPlugin from 'eslint-plugin-oxlint';

import { biomeOverrides } from '../biome/eslint-overrides.js';
import { recommended, testingConfig } from '../eslint/config.js';
import { typeAwareOverrides } from '../oxlint/type-aware-overrides.js';

const exec = promisify(execFile);

// ── Formatting helpers ──────────────────────────────────────────────────────

const formatViolations = (label, messages) => {
    if (messages.length === 0) {
        return '';
    }
    const lines = messages.map(
        (message) =>
            `  ${message.line}:${message.column} ${message.ruleId} (${message.severity === 2 ? 'error' : 'warn'})`
    );
    return `${label}: expected 0 violations, got ${messages.length}:\n${lines.join('\n')}`;
};

const formatOxlintViolations = (diagnostics) => {
    if (diagnostics.length === 0) {
        return '';
    }
    const lines = diagnostics.map(
        (diag) => `  ${diag.labels?.[0]?.span?.line}:${diag.labels?.[0]?.span?.column} ${diag.code}`
    );
    return `OxLint: expected 0 violations, got ${diagnostics.length}:\n${lines.join('\n')}`;
};

const ROOT = path.resolve(import.meta.dirname, '..');
const FIXTURE_DIR = path.join(ROOT, '__tests__', 'fixtures');
const VALID_FIXTURE = path.join(FIXTURE_DIR, 'fixture-valid.tsx');
const INVALID_FIXTURE = path.join(FIXTURE_DIR, 'fixture-invalid.tsx');

// ── Shared ESLint config overrides for fixtures ─────────────────────────────

const fixtureTypeScriptOverride = {
    files: ['__tests__/fixtures/**/*.ts', '__tests__/fixtures/**/*.tsx'],
    languageOptions: {
        parserOptions: {
            project: path.join(FIXTURE_DIR, 'tsconfig.json'),
            tsconfigRootDir: FIXTURE_DIR
        }
    }
};

// React is not in this package's deps; @types/react not installed
const fixtureRelaxOverride = {
    files: ['__tests__/fixtures/**/*.tsx'],
    rules: {
        'import-x/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off'
    }
};

// ── ESLint factory functions ────────────────────────────────────────────────

const createPureESLint = () =>
    new ESLint({
        overrideConfigFile: true,
        overrideConfig: [...recommended, testingConfig, fixtureTypeScriptOverride, fixtureRelaxOverride],
        cwd: ROOT
    });

const createOxlintHybridESLint = () => {
    const oxlintConfigs = oxlintPlugin.buildFromOxlintConfigFile(path.join(ROOT, 'oxlint', 'config.json'));
    return new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            ...recommended,
            testingConfig,
            fixtureTypeScriptOverride,
            fixtureRelaxOverride,
            ...oxlintConfigs,
            typeAwareOverrides
        ],
        cwd: ROOT
    });
};

const createBiomeHybridESLint = () =>
    new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            ...recommended,
            testingConfig,
            fixtureTypeScriptOverride,
            fixtureRelaxOverride,
            biomeConfig,
            biomeOverrides
        ],
        cwd: ROOT
    });

// ── Linting helpers ─────────────────────────────────────────────────────────

/**
 * Lint a fixture file and return all messages.
 * @param {ESLint} eslint
 * @param {string} filePath - absolute path to fixture
 * @returns {Promise<import('eslint').ESLint.LintMessage[]>}
 */
const lintWith = async (eslint, filePath) => {
    const results = await eslint.lintFiles([filePath]);
    return results[0]?.messages || [];
};

/**
 * Extract unique ruleIds from lint messages.
 * @param {import('eslint').ESLint.LintMessage[]} messages
 * @returns {Set<string>}
 */
const extractRuleIds = (messages) => new Set(messages.map((message) => message.ruleId).filter(Boolean));

/**
 * Run OxLint CLI on a fixture file, return diagnostics.
 * Uses .oxlintrc.json from project root (includes jsPlugins).
 */
const runOxlintCli = async (filePath) => {
    try {
        const { stdout } = await exec(
            path.join(ROOT, 'node_modules', '.bin', 'oxlint'),
            ['--format', 'json', filePath],
            { cwd: ROOT }
        );
        return JSON.parse(stdout);
    } catch (error) {
        // OxLint exits non-zero when it finds violations
        if (error.stdout) {
            return JSON.parse(error.stdout);
        }
        throw error;
    }
};

/**
 * Run Biome CLI on a fixture file, return diagnostics.
 */
const runBiomeCli = async (filePath) => {
    try {
        const { stdout } = await exec(
            path.join(ROOT, 'node_modules', '.bin', 'biome'),
            ['lint', '--config-path', path.join(ROOT, 'biome', 'config.json'), '--reporter', 'json', filePath],
            { cwd: ROOT }
        );
        return JSON.parse(stdout);
    } catch (error) {
        // Biome exits non-zero when it finds violations
        if (error.stdout) {
            return JSON.parse(error.stdout);
        }
        throw error;
    }
};

/**
 * Check if OxLint diagnostics cover a given line.
 * NOTE: line-level check only — a different OxLint rule on the same line
 * would satisfy this. Rule-name mapping (OxLint→ESLint) is not implemented
 * because OxLint uses different naming conventions (e.g. "eslint(no-var)").
 * The "no rules fall through the cracks" test above uses rule-level
 * comparison via extractRuleIds, so this is only a secondary safety net.
 */
const oxlintCoversLine = (diagnostics, line) =>
    diagnostics.diagnostics.some((diag) => {
        const label = diag.labels?.[0];
        return label && label.span?.line === line;
    });

/**
 * Check if Biome diagnostics cover a given line.
 * Same line-level limitation as oxlintCoversLine — see note above.
 */
const biomeCoversLine = (diagnostics, line) =>
    diagnostics.diagnostics.some((diag) => diag.location?.start?.line === line);

// ═══════════════════════════════════════════════════════════════════════════
// OxLint hybrid idempotency
// ═══════════════════════════════════════════════════════════════════════════

describe('OxLint hybrid idempotency', () => {
    /** @type {import('eslint').ESLint.LintMessage[]} */
    let pureMessages;
    /** @type {import('eslint').ESLint.LintMessage[]} */
    let hybridMessages;
    let oxlintDiagnostics;

    before(async () => {
        const [pure, hybrid, oxlint] = await Promise.all([
            lintWith(createPureESLint(), INVALID_FIXTURE),
            lintWith(createOxlintHybridESLint(), INVALID_FIXTURE),
            runOxlintCli(INVALID_FIXTURE)
        ]);
        pureMessages = pure;
        hybridMessages = hybrid;
        oxlintDiagnostics = oxlint;
    });

    // ── Valid fixture: zero violations ──────────────────────────────────

    test('fixture-valid.tsx: pure ESLint → 0 violations', async () => {
        const messages = await lintWith(createPureESLint(), VALID_FIXTURE);
        assert.strictEqual(messages.length, 0, formatViolations('Pure ESLint', messages));
    });

    test('fixture-valid.tsx: OxLint CLI → 0 violations', async () => {
        const result = await runOxlintCli(VALID_FIXTURE);
        const violations = result.diagnostics || [];
        assert.strictEqual(violations.length, 0, formatOxlintViolations(violations));
    });

    test('fixture-valid.tsx: ESLint hybrid OxLint → 0 violations', async () => {
        const messages = await lintWith(createOxlintHybridESLint(), VALID_FIXTURE);
        assert.strictEqual(messages.length, 0, formatViolations('ESLint hybrid OxLint', messages));
    });

    // ── Invalid fixture: gap detection ─────────────────────────────────

    test('fixture-invalid.tsx: no rules fall through the cracks', () => {
        const pureRules = extractRuleIds(pureMessages);
        const hybridRules = extractRuleIds(hybridMessages);

        // Rules in pure ESLint but NOT in hybrid = disabled by bridge
        const gapRules = new Set([...pureRules].filter((rule) => !hybridRules.has(rule)));

        if (gapRules.size === 0) {
            return;
        }

        // For each gap rule, verify OxLint catches a violation at the same line
        const uncoveredGaps = [];

        for (const ruleId of gapRules) {
            const pureViolationsForRule = pureMessages.filter((message) => message.ruleId === ruleId);

            for (const violation of pureViolationsForRule) {
                if (!oxlintCoversLine(oxlintDiagnostics, violation.line)) {
                    uncoveredGaps.push({
                        ruleId,
                        line: violation.line,
                        message: violation.message
                    });
                }
            }
        }

        if (uncoveredGaps.length > 0) {
            const details = uncoveredGaps.map((gap) => `  ${gap.ruleId} (line ${gap.line}): ${gap.message}`).join('\n');
            assert.fail(
                `${uncoveredGaps.length} rule(s) fell through the cracks!\n` +
                    `These rules were disabled by eslint-plugin-oxlint bridge but OxLint does not catch them:\n${
                        details
                    }`
            );
        }
    });

    test('fixture-invalid.tsx: hybrid ESLint + OxLint CLI cover all pure ESLint violations', () => {
        const uncoveredLines = [];

        for (const message of pureMessages) {
            const hybridCatches = hybridMessages.some(
                (hybridMessage) => hybridMessage.ruleId === message.ruleId && hybridMessage.line === message.line
            );
            const oxlintCatches = oxlintCoversLine(oxlintDiagnostics, message.line);

            if (!hybridCatches && !oxlintCatches) {
                uncoveredLines.push({
                    ruleId: message.ruleId,
                    line: message.line,
                    message: message.message
                });
            }
        }

        if (uncoveredLines.length > 0) {
            const details = uncoveredLines
                .map((gap) => `  ${gap.ruleId} (line ${gap.line}): ${gap.message}`)
                .join('\n');
            assert.fail(`${uncoveredLines.length} violation(s) not covered by hybrid setup!\n${details}`);
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Biome hybrid idempotency
// ═══════════════════════════════════════════════════════════════════════════

describe('Biome hybrid idempotency', () => {
    /** @type {import('eslint').ESLint.LintMessage[]} */
    let pureMessages;
    /** @type {import('eslint').ESLint.LintMessage[]} */
    let hybridMessages;
    let biomeDiagnostics;

    before(async () => {
        const [pure, hybrid, biome] = await Promise.all([
            lintWith(createPureESLint(), INVALID_FIXTURE),
            lintWith(createBiomeHybridESLint(), INVALID_FIXTURE),
            runBiomeCli(INVALID_FIXTURE)
        ]);
        pureMessages = pure;
        hybridMessages = hybrid;
        biomeDiagnostics = biome;
    });

    // ── Valid fixture: zero violations ──────────────────────────────────
    // NOTE: no Biome CLI valid test — Biome has extra rules without ESLint
    // equivalents (useComponentExportOnlyModules, noUndeclaredDependencies)
    // that fire on fixtures designed for ESLint. Hybrid ESLint is the real check.

    test('fixture-valid.tsx: ESLint hybrid Biome → 0 violations', async () => {
        const messages = await lintWith(createBiomeHybridESLint(), VALID_FIXTURE);
        assert.strictEqual(messages.length, 0, formatViolations('ESLint hybrid Biome', messages));
    });

    // ── Invalid fixture: gap detection ─────────────────────────────────

    test('fixture-invalid.tsx: no rules fall through the cracks', () => {
        const pureRules = extractRuleIds(pureMessages);
        const hybridRules = extractRuleIds(hybridMessages);

        const gapRules = new Set([...pureRules].filter((rule) => !hybridRules.has(rule)));

        if (gapRules.size === 0) {
            return;
        }

        const uncoveredGaps = [];

        for (const ruleId of gapRules) {
            const pureViolationsForRule = pureMessages.filter((message) => message.ruleId === ruleId);

            for (const violation of pureViolationsForRule) {
                if (!biomeCoversLine(biomeDiagnostics, violation.line)) {
                    uncoveredGaps.push({
                        ruleId,
                        line: violation.line,
                        message: violation.message
                    });
                }
            }
        }

        if (uncoveredGaps.length > 0) {
            const details = uncoveredGaps.map((gap) => `  ${gap.ruleId} (line ${gap.line}): ${gap.message}`).join('\n');
            assert.fail(
                `${uncoveredGaps.length} rule(s) fell through the cracks!\n` +
                    `These rules were disabled by Biome bridge but Biome does not catch them:\n${details}`
            );
        }
    });

    test('fixture-invalid.tsx: hybrid ESLint + Biome CLI cover all pure ESLint violations', () => {
        const uncoveredLines = [];

        for (const message of pureMessages) {
            const hybridCatches = hybridMessages.some(
                (hybridMessage) => hybridMessage.ruleId === message.ruleId && hybridMessage.line === message.line
            );
            const biomeCatches = biomeCoversLine(biomeDiagnostics, message.line);

            if (!hybridCatches && !biomeCatches) {
                uncoveredLines.push({
                    ruleId: message.ruleId,
                    line: message.line,
                    message: message.message
                });
            }
        }

        if (uncoveredLines.length > 0) {
            const details = uncoveredLines
                .map((gap) => `  ${gap.ruleId} (line ${gap.line}): ${gap.message}`)
                .join('\n');
            assert.fail(`${uncoveredLines.length} violation(s) not covered by hybrid setup!\n${details}`);
        }
    });
});
