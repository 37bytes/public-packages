/**
 * ESLint overrides for hybrid Biome + ESLint setup
 *
 * eslint-config-biome disables ~529 ESLint rules that have Biome equivalents,
 * but only covers "recommended" Biome rules. These 28 rules are in our Biome
 * config but NOT disabled by the bridge — we turn them off manually.
 * Also re-enables 1 rule the bridge incorrectly disables (our config skips a11y).
 *
 * Usage in consumer's eslint.config.mjs:
 * ```js
 * import biome from 'eslint-config-biome';
 * import { biomeOverrides } from '@37bytes/code-style/biome/eslint-overrides';
 *
 * export default [
 *     ...yourConfigs,
 *     biome,           // static bridge: disables ~529 rules
 *     biomeOverrides   // manual: disables remaining 29 rules covered by our Biome config
 * ];
 * ```
 *
 * When updating biome/rules/*.js, re-check this list:
 * Run the bridge analysis script to find newly uncovered rules.
 */

export const biomeOverrides = {
    name: '@37bytes/biome-eslint-overrides',
    rules: {
        // ESLint core — covered by Biome but not in bridge's recommended set
        'no-console': 'off',
        'no-nested-ternary': 'off',
        curly: 'off',
        'default-case': 'off',
        'no-throw-literal': 'off',
        'no-var': 'off',
        'no-useless-concat': 'off',
        'no-undef': 'off',
        'no-await-in-loop': 'off',

        // @typescript-eslint — covered by Biome
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/prefer-as-const': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',

        // React — covered by Biome (post-@eslint-react migration: rule names
        // changed from `react/*` to `@eslint-react/*`; jsx stylistic rules
        // are now provided by `@stylistic/*` and our local `@37bytes/jsx-*`).
        '@stylistic/jsx-curly-brace-presence': 'off',
        '@37bytes/jsx-boolean-value': 'off',
        '@37bytes/jsx-fragments': 'off',
        // RE-ENABLE: eslint-config-biome disables button-has-type thinking Biome
        // a11y covers it, but our config uses recommended:false and skips a11y
        '@eslint-react/dom-no-missing-button-type': 'warn',

        // Next.js — covered by Biome 'next' domain
        '@next/next/google-font-display': 'off',
        '@next/next/no-document-import-in-page': 'off',
        '@next/next/no-head-import-in-document': 'off',
        '@next/next/no-head-element': 'off',
        '@next/next/no-img-element': 'off',
        '@next/next/google-font-preconnect': 'off',
        '@next/next/no-unwanted-polyfillio': 'off',
        '@next/next/no-sync-scripts': 'off',
        '@next/next/inline-script-id': 'off',
        '@next/next/no-async-client-component': 'off',

        // Import — covered by Biome
        'import-x/no-default-export': 'off',
        'import-x/no-cycle': 'off',

        // Nursery type-aware — covered by Biome (top ESLint bottlenecks)
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        // @typescript-eslint/no-unnecessary-condition: promoted into eslint in Task D (2026-06-07).
        // Removed from overrides so ESLint enforces it (policy: eslint is source of truth).

        // Nursery ESLint core — covered by Biome
        'no-proto': 'off',
        // NOT disabling no-script-url: Biome's noScriptUrl only checks JSX href,
        // ESLint also catches string literals like 'javascript:void(0)'
        'no-multi-str': 'off',
        'no-useless-return': 'off',

        // Nursery React — covered by Biome
        '@eslint-react/no-leaked-conditional-rendering': 'off'
    }
};
