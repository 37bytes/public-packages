/**
 * Testing rules: vitest/jest → Biome test domain + relaxed overrides
 *
 * Biome has the 'test' domain that auto-activates for test files.
 * We also relax certain strict rules in test files.
 *
 * Source: eslint/rules/testing.js
 */

/**
 * Test-specific rules (applied via test domain or overrides)
 */
export const testing = {
    suspicious: {
        noFocusedTests: 'error', // vitest/no-focused-tests (inspired)
        noSkippedTests: 'warn', // vitest/no-disabled-tests (inspired)
        noDuplicateTestHooks: 'warn', // jest/no-duplicate-hooks (inspired)
        noExportsInTest: 'error', // jest/no-export (inspired)
        noConsole: 'off' // relax: allow console in tests
    },
    complexity: {
        noExcessiveCognitiveComplexity: 'off' // relax: test functions can be complex
    },
    correctness: {
        noUndeclaredVariables: 'off' // relax: test globals
    },
    nursery: {
        // ESLint and OxLint both turn off @typescript-eslint/no-floating-promises for test files
        // (eslint/rules/testing.js:83, oxlint/rules/testing.js:17). Mirror that here.
        noFloatingPromises: 'off' // @typescript-eslint/no-floating-promises: off for tests
    }
};

/**
 * ESLint testing rules with NO Biome equivalent (stay ESLint-only):
 *
 * — vitest/valid-expect, vitest/valid-title, vitest/no-identical-title
 * — vitest/prefer-to-have-length, prefer-to-be, prefer-to-contain
 * — vitest/prefer-equality-matcher, vitest/consistent-test-it
 * — testing-library/* (all 9 rules)
 * — jest-dom/* (all 10 rules)
 */
