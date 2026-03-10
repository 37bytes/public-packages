/**
 * @fileoverview Integration tests for ESLint recommended config with fixtures
 *
 * Lints fixture-valid.tsx (zero violations) and fixture-invalid.tsx (expected violations)
 * using the full recommended config.
 */

import assert from 'node:assert';
import path from 'node:path';
import { before, describe, test } from 'node:test';

import { ESLint } from 'eslint';

import { recommended } from '../eslint/config.js';

const __dirname = import.meta.dirname;
const FIXTURE_DIR = path.join(__dirname, 'fixtures');

/**
 * Creates an ESLint instance configured with the recommended config
 * and a tsconfig for the fixture files.
 */
const createESLint = () =>
    new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            ...recommended,
            {
                files: ['**/*.ts', '**/*.tsx'],
                languageOptions: {
                    parserOptions: {
                        project: path.join(FIXTURE_DIR, 'tsconfig.json'),
                        tsconfigRootDir: FIXTURE_DIR
                    }
                }
            },
            // Fixture-specific overrides:
            // - no-extraneous-dependencies: react is not in this package's deps
            // - no-unsafe-*: @types/react is not installed, so React API is untyped
            {
                files: ['**/*.tsx'],
                rules: {
                    'import-x/no-extraneous-dependencies': 'off',
                    '@typescript-eslint/no-unsafe-argument': 'off',
                    '@typescript-eslint/no-unsafe-assignment': 'off',
                    '@typescript-eslint/no-unsafe-call': 'off',
                    '@typescript-eslint/no-unsafe-member-access': 'off',
                    '@typescript-eslint/no-unsafe-return': 'off'
                }
            }
        ],
        cwd: FIXTURE_DIR
    });

/**
 * Lints a fixture file and returns all messages.
 *
 * @param {string} filename - fixture filename (e.g. 'good.tsx')
 * @returns {Promise<import('eslint').ESLint.LintMessage[]>}
 */
const lintFixture = async (filename) => {
    const eslint = createESLint();
    const filePath = path.join(FIXTURE_DIR, filename);
    const results = await eslint.lintFiles([filePath]);
    return results[0]?.messages || [];
};

// ─── fixture-valid.tsx: zero violations ─────────────────────────────────────

describe('fixtures: fixture-valid.tsx', () => {
    test('should have zero errors and zero warnings', async () => {
        const messages = await lintFixture('fixture-valid.tsx');

        const errors = messages.filter((message) => message.severity === 2);
        const warnings = messages.filter((message) => message.severity === 1);

        if (messages.length > 0) {
            const summary = messages.map(
                (message) =>
                    `  ${message.line}:${message.column} ${message.ruleId} (${message.severity === 2 ? 'error' : 'warn'})`
            );
            assert.fail(`Expected zero violations, got ${messages.length}:\n${summary.join('\n')}`);
        }

        assert.strictEqual(errors.length, 0, 'should have zero errors');
        assert.strictEqual(warnings.length, 0, 'should have zero warnings');
    });
});

// ─── fixture-invalid.tsx: expected violations ───────────────────────────────

/**
 * Helper: asserts a specific ruleId is present in the messages array.
 *
 * @param {import('eslint').ESLint.LintMessage[]} messages
 * @param {string} ruleId
 */
const assertRule = (messages, ruleId) => {
    const match = messages.find((message) => message.ruleId === ruleId);
    assert.ok(match, `Expected ${ruleId} violation. Got: ${messages.map((message) => message.ruleId).join(', ')}`);
};

describe('fixtures: fixture-invalid.tsx', () => {
    /** @type {import('eslint').ESLint.LintMessage[]} */
    let messages;

    before(async () => {
        messages = await lintFixture('fixture-invalid.tsx');
    });

    test('should have at least 20 violations', () => {
        assert.ok(messages.length >= 20, `Expected at least 20 violations, got ${messages.length}`);
    });

    // ─── javascript.js rules ────────────────────────────────────────────────

    test('should report no-var', () => {
        assertRule(messages, 'no-var');
    });

    test('should report no-eval', () => {
        assertRule(messages, 'no-eval');
    });

    test('should report no-nested-ternary', () => {
        assertRule(messages, 'no-nested-ternary');
    });

    test('should report object-shorthand', () => {
        assertRule(messages, 'object-shorthand');
    });

    test('should report prefer-template', () => {
        assertRule(messages, 'prefer-template');
    });

    test('should report prefer-const', () => {
        assertRule(messages, 'prefer-const');
    });

    test('should report no-console', () => {
        assertRule(messages, 'no-console');
    });

    test('should report eqeqeq', () => {
        assertRule(messages, 'eqeqeq');
    });

    test('should report unicorn/prefer-native-coercion-functions', () => {
        assertRule(messages, 'unicorn/prefer-native-coercion-functions');
    });

    test('should report no-useless-escape', () => {
        assertRule(messages, 'no-useless-escape');
    });

    // ─── browser.js rules ───────────────────────────────────────────────────

    test('should report no-script-url', () => {
        assertRule(messages, 'no-script-url');
    });

    // ─── typescript.js rules ────────────────────────────────────────────────

    test('should report @typescript-eslint/naming-convention', () => {
        assertRule(messages, '@typescript-eslint/naming-convention');
    });

    test('should report @typescript-eslint/no-explicit-any', () => {
        assertRule(messages, '@typescript-eslint/no-explicit-any');
    });

    test('should report @typescript-eslint/no-unused-vars', () => {
        assertRule(messages, '@typescript-eslint/no-unused-vars');
    });

    // ─── react.js rules ────────────────────────────────────────────────────

    test('should report react/function-component-definition', () => {
        assertRule(messages, 'react/function-component-definition');
    });

    test('should report react/boolean-prop-naming', () => {
        assertRule(messages, 'react/boolean-prop-naming');
    });

    test('should report react/self-closing-comp', () => {
        assertRule(messages, 'react/self-closing-comp');
    });

    test('should report react/button-has-type', () => {
        assertRule(messages, 'react/button-has-type');
    });

    // ─── imports.js rules ──────────────────────────────────────────────────

    test('should report import-x/no-default-export', () => {
        assertRule(messages, 'import-x/no-default-export');
    });

    // ─── quality.js (sonarjs) rules ─────────────────────────────────────────

    test('should report sonarjs/no-collapsible-if', () => {
        assertRule(messages, 'sonarjs/no-collapsible-if');
    });

    test('should report sonarjs/prefer-single-boolean-return', () => {
        assertRule(messages, 'sonarjs/prefer-single-boolean-return');
    });

    // ─── regexp.js rules ────────────────────────────────────────────────────

    test('should report regexp/prefer-d', () => {
        assertRule(messages, 'regexp/prefer-d');
    });

    test('should report regexp/no-useless-escape', () => {
        assertRule(messages, 'regexp/no-useless-escape');
    });

    // ─── custom @37bytes rules ──────────────────────────────────────────────

    test('should report @37bytes/boolean-naming', () => {
        assertRule(messages, '@37bytes/boolean-naming');
    });
});
