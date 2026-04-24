/**
 * @fileoverview React ESLint rules
 * @author 37bytes
 *
 * Rules for React components, hooks, and JSX.
 *
 * Uses @eslint-react/eslint-plugin@4.x (replaces eslint-plugin-react which
 * blocked ESLint 10 upgrade) and eslint-plugin-react-hooks.
 *
 * Rule ID naming: @eslint-react uses flat kebab-case names under a single
 * plugin namespace, e.g. `@eslint-react/dom-no-dangerously-set-innerhtml`
 * (NOT `@eslint-react/dom/no-dangerously-set-innerhtml`). Do not confuse
 * with the rule categories on their docs site (dom / jsx / web-api / x)
 * which are documentation groupings only.
 *
 * See `react-stylistic.js` for stylistic JSX rules that @eslint-react does
 * not ship (boolean value, curly braces, fragments). Those live in
 * @stylistic/eslint-plugin-jsx.
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * React rules for @37bytes projects
 * @type {import('eslint').Linter.RulesRecord}
 */
export const react = {
    // === Hooks Rules (Critical) — stays on eslint-plugin-react-hooks ===
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // === Keys and Lists ===
    // react/jsx-key was split into 3 separate rules in @eslint-react:
    '@eslint-react/no-missing-key': 'error',
    '@eslint-react/no-duplicate-key': 'error',
    '@eslint-react/jsx-no-key-after-spread': 'error',
    '@eslint-react/no-array-index-key': 'warn',

    // === Conditional Rendering ===
    '@eslint-react/no-leaked-conditional-rendering': 'error',

    // === Undefined and Usage ===
    '@eslint-react/jsx-no-comment-textnodes': 'warn',
    '@eslint-react/dom-no-unknown-property': 'warn',

    // === State Management ===
    '@eslint-react/no-direct-mutation-state': 'error',
    '@eslint-react/no-access-state-in-setstate': 'error',
    '@eslint-react/no-unused-state': 'error',

    // === Component Lifecycle (was react/no-deprecated) ===
    '@eslint-react/no-component-will-mount': 'warn',
    '@eslint-react/no-component-will-receive-props': 'warn',
    '@eslint-react/no-component-will-update': 'warn',
    '@eslint-react/dom-no-hydrate': 'warn',
    '@eslint-react/dom-no-render': 'warn',
    '@eslint-react/no-context-provider': 'warn',
    '@eslint-react/no-forward-ref': 'warn',

    // === Dangerous Patterns ===
    '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'warn',
    '@eslint-react/jsx-no-children-prop': 'warn',
    '@eslint-react/no-nested-component-definitions': 'error',
    '@eslint-react/no-unstable-default-props': 'warn',

    // === Style ===
    '@eslint-react/dom-no-string-style-prop': 'warn',

    // === Buttons ===
    '@eslint-react/dom-no-missing-button-type': 'warn',

    // === Security ===
    '@eslint-react/dom-no-dangerously-set-innerhtml': 'error',
    '@eslint-react/dom-no-script-url': 'error',
    '@eslint-react/dom-no-missing-iframe-sandbox': 'error',
    '@eslint-react/dom-no-unsafe-target-blank': 'warn'
};
