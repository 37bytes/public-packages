/**
 * @fileoverview Testing override rules for OxLint
 *
 * Goes into overrides[1] for test files.
 * Relaxes strict rules in test code.
 * Maps to eslint/rules/testing.js (testRelaxedRules subset).
 */

export const testing = {
    'no-magic-numbers': 'off',
    'no-console': 'off',
    // NOT disabling no-unused-vars: ESLint testConfig keeps it enabled for tests
    'typescript/no-explicit-any': 'off',
    'typescript/no-unsafe-assignment': 'off',
    'typescript/no-unsafe-call': 'off',
    'typescript/no-unsafe-member-access': 'off',
    'typescript/no-floating-promises': 'off'
};
