/**
 * @fileoverview Testing override rules for OxLint
 *
 * Goes into overrides[1] for test files.
 * Relaxes strict rules in test code.
 * Maps to eslint/rules/testing.js (testRelaxedRules subset).
 *
 * jest/* rules: oxlint exposes vitest-compatible testing rules only under the jest/* plugin
 * namespace (oxlint --rules shows jest/consistent-test-it etc., not vitest/ equivalents).
 * Severities match eslint/rules/testing.js vitestRules. (Verified 2026-06-07, oxlint 1.61.0.)
 */

export const testing = {
    'no-magic-numbers': 'off',
    'no-console': 'off',
    // NOT disabling no-unused-vars: ESLint testConfig keeps it enabled for tests
    'typescript/no-explicit-any': 'off',
    'typescript/no-unsafe-assignment': 'off',
    'typescript/no-unsafe-call': 'off',
    'typescript/no-unsafe-member-access': 'off',
    'typescript/no-floating-promises': 'off',

    // === jest/* vitest-compatible rules (oxlint has no vitest/* variants for these) ===
    'jest/no-duplicate-hooks': 'warn', // vitest/no-duplicate-hooks
    'jest/no-focused-tests': 'error', // vitest/no-focused-tests
    'jest/no-disabled-tests': 'warn', // vitest/no-disabled-tests
    'jest/no-identical-title': 'error', // vitest/no-identical-title
    'jest/valid-expect': 'error', // vitest/valid-expect
    'jest/valid-title': 'error', // vitest/valid-title
    'jest/prefer-to-have-length': 'warn', // vitest/prefer-to-have-length
    'jest/prefer-to-be': 'warn', // vitest/prefer-to-be
    'jest/prefer-to-contain': 'warn', // vitest/prefer-to-contain
    'jest/prefer-equality-matcher': 'warn', // vitest/prefer-equality-matcher
    'jest/consistent-test-it': ['warn', { fn: 'test' }] // vitest/consistent-test-it
};
