/**
 * @fileoverview ESLint overrides for hybrid OxLint + tsgolint + ESLint setup
 *
 * When using `oxlint --type-aware`, tsgolint handles type-aware rules.
 * This config disables corresponding ESLint rules to avoid duplicate work.
 *
 * Usage in ESLint config:
 * ```js
 * import { typeAwareOverrides } from '@37bytes/code-style/oxlint/type-aware-overrides';
 * import oxlint from 'eslint-plugin-oxlint';
 *
 * export default [
 *     ...yourConfigs,
 *     // 1. eslint-plugin-oxlint disables AST rules covered by oxlint
 *     ...oxlint.buildFromOxlintConfigFile('node_modules/@37bytes/code-style/oxlint/config.json'),
 *     // 2. Disable type-aware rules covered by tsgolint (--type-aware flag)
 *     typeAwareOverrides
 * ];
 * ```
 *
 * Rules disabled here are the intersection of:
 * - Our ESLint typescript rules (eslint/rules/typescript.js)
 * - tsgolint-supported rules (59 type-aware rules)
 *
 * Rules NOT disabled (kept in ESLint):
 * - @typescript-eslint/naming-convention — not implemented in tsgolint
 * - @typescript-eslint/consistent-type-imports — not implemented in tsgolint
 * - Non-type-aware rules — handled by eslint-plugin-oxlint bridge
 */

/**
 * ESLint config object that disables type-aware rules covered by tsgolint.
 * Apply AFTER eslint-plugin-oxlint configs.
 *
 * @type {import('eslint').Linter.Config}
 */
export const typeAwareOverrides = {
    name: '@37bytes/oxlint-type-aware-overrides',
    rules: {
        // === Promises & Async (biggest performance win) ===
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/return-await': 'off',

        // === Type Safety ===
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',

        // === Other type-aware rules ===
        '@typescript-eslint/only-throw-error': 'off',
        '@typescript-eslint/consistent-type-exports': 'off'
    }
};
