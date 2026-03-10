/**
 * @fileoverview Import/Export ESLint rules
 * @author 37bytes
 *
 * Rules for managing imports and exports in the codebase.
 * Uses eslint-plugin-import-x with eslint-import-resolver-typescript.
 *
 * Note: Resolution rules (no-unresolved, named, export) are intentionally omitted.
 * TypeScript already validates these at compile time. Including them would be
 * redundant for TS projects and require additional resolver setup for JS projects.
 * The typescript resolver is still needed for rules like no-cycle and no-duplicates.
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Import rules for @37bytes projects
 * @type {import('eslint').Linter.RulesRecord}
 */
export const imports = {
    // === Import Order and Structure ===
    'import-x/first': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/first.md
    'import-x/newline-after-import': ['error', { count: 1 }], // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/newline-after-import.md
    'import-x/order': 'warn', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/order.md

    // === Export Rules ===
    'import-x/no-mutable-exports': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-mutable-exports.md
    'import-x/no-anonymous-default-export': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-anonymous-default-export.md
    'import-x/no-default-export': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-default-export.md

    // === Duplicates and Cycles ===
    'import-x/no-duplicates': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-duplicates.md
    'import-x/no-cycle': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-cycle.md
    'import-x/no-self-import': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-self-import.md

    // === Path Cleanup ===
    'import-x/no-empty-named-blocks': 'warn', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-empty-named-blocks.md
    'import-x/no-useless-path-segments': 'warn', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-useless-path-segments.md

    // === Module System ===
    'import-x/no-amd': 'error', // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-amd.md

    // === Dependencies ===
    'import-x/no-extraneous-dependencies': [
        'error',
        {
            devDependencies: ['**/__tests__/**', '**/*.stories.tsx']
        }
    ], // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-extraneous-dependencies.md

    // === Webpack ===
    'import-x/no-webpack-loader-syntax': 'error' // https://github.com/un-ts/eslint-plugin-import-x/blob/main/docs/rules/no-webpack-loader-syntax.md
};
