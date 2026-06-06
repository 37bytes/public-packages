/**
 * @fileoverview Import rules for OxLint
 *
 * Maps to eslint/rules/imports.js.
 * Note: OxLint uses 'import/' prefix (ESLint uses 'import-x/').
 * Also includes unicorn/prefer-node-protocol (import-related).
 */

export const imports = {
    'import/first': 'error',
    // import/newline-after-import — not available in OxLint, stays ESLint-only
    // import/order — not available in OxLint, stays ESLint-only
    'import/no-mutable-exports': 'error',
    'import/no-anonymous-default-export': 'error',
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-empty-named-blocks': 'warn',
    'import/no-amd': 'error',
    'import/no-commonjs': 'error', // import-x/no-commonjs (promoted from biome style/noCommonJs)
    'import/no-webpack-loader-syntax': 'error'
};
