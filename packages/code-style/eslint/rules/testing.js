/**
 * @fileoverview Testing ESLint rules
 * @author 37bytes
 *
 * Rules for test files using Vitest, Testing Library, and node:test.
 *
 * Required peer dependencies (install in your project):
 * - @vitest/eslint-plugin
 * - eslint-plugin-testing-library (for React component tests)
 * - eslint-plugin-jest-dom (for DOM matchers)
 *
 * File pattern: __tests__/*.test.[js,ts,jsx,tsx]
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Vitest rules for unit tests
 * @type {import('eslint').Linter.RulesRecord}
 */
export const vitestRules = {
    // === Critical ===
    'vitest/no-focused-tests': 'error', // No .only() in commits — breaks CI
    'vitest/no-disabled-tests': 'warn', // No .skip() forgotten
    'vitest/no-identical-title': 'error', // Unique test names
    'vitest/valid-expect': 'error', // Correct expect() usage
    'vitest/valid-title': 'error', // No empty titles

    // === Best Practices ===
    'vitest/prefer-to-have-length': 'warn', // .toHaveLength() instead of .length
    'vitest/prefer-to-be': 'warn', // .toBe() for primitives
    'vitest/prefer-to-contain': 'warn', // .toContain() for arrays
    'vitest/prefer-equality-matcher': 'warn', // Correct equality matcher
    'vitest/consistent-test-it': ['warn', { fn: 'test' }], // Use test() not it()

    // === Off ===
    'vitest/prefer-expect-assertions': 'off', // Too strict
    'vitest/max-expects': 'off' // Sometimes need multiple expects
};

/**
 * Testing Library rules for React component tests
 * @type {import('eslint').Linter.RulesRecord}
 */
export const testingLibraryRules = {
    // === Critical ===
    'testing-library/await-async-queries': 'error', // Must await findBy*
    'testing-library/await-async-utils': 'error', // Must await waitFor
    'testing-library/no-wait-for-empty-callback': 'error', // waitFor must have assertions

    // === Best Practices ===
    'testing-library/prefer-screen-queries': 'warn', // screen.getBy* instead of destructure
    'testing-library/prefer-presence-queries': 'warn', // getBy for present, queryBy for absent
    'testing-library/prefer-find-by': 'warn', // findBy* instead of waitFor + getBy*
    'testing-library/no-debugging-utils': 'warn', // No debug() in commits
    'testing-library/no-container': 'warn', // No container.querySelector
    'testing-library/no-node-access': 'warn', // No .firstChild, .parentElement

    // === Off ===
    'testing-library/render-result-naming-convention': 'off' // Flexible naming
};

/**
 * jest-dom rules for semantic matchers (with auto-fix!)
 * @type {import('eslint').Linter.RulesRecord}
 */
export const jestDomRules = {
    'jest-dom/prefer-checked': 'warn', // .toBeChecked()
    'jest-dom/prefer-enabled-disabled': 'warn', // .toBeEnabled() / .toBeDisabled()
    'jest-dom/prefer-focus': 'warn', // .toHaveFocus()
    'jest-dom/prefer-in-document': 'warn', // .toBeInTheDocument()
    'jest-dom/prefer-required': 'warn', // .toBeRequired()
    'jest-dom/prefer-to-have-attribute': 'warn', // .toHaveAttribute()
    'jest-dom/prefer-to-have-class': 'warn', // .toHaveClass()
    'jest-dom/prefer-to-have-style': 'warn', // .toHaveStyle()
    'jest-dom/prefer-to-have-text-content': 'warn', // .toHaveTextContent()
    'jest-dom/prefer-to-have-value': 'warn' // .toHaveValue()
};

/**
 * Rules to relax in test files
 * @type {import('eslint').Linter.RulesRecord}
 */
export const testOverrides = {
    // Magic numbers OK in tests
    'no-magic-numbers': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',

    // Long test functions OK
    'max-lines-per-function': 'off',

    // Test complexity OK
    complexity: 'off',

    // Floating promises OK for some test patterns
    '@typescript-eslint/no-floating-promises': 'off',

    // Explicit any OK in tests
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',

    // Console OK in tests
    'no-console': 'off'
};

/**
 * Combined testing rules
 * Use with Vitest for unit tests
 * @type {import('eslint').Linter.RulesRecord}
 */
export const testing = {
    ...vitestRules,
    ...testOverrides
};

/**
 * Combined testing rules for React components
 * Use with Vitest + Testing Library + jest-dom
 * @type {import('eslint').Linter.RulesRecord}
 */
export const testingReact = {
    ...vitestRules,
    ...testingLibraryRules,
    ...jestDomRules,
    ...testOverrides
};
