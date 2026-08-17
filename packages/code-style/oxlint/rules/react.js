/**
 * @fileoverview React + React Hooks rules for OxLint
 *
 * Maps to eslint/rules/react.js.
 */

export const react = {
    // react/prop-types — not available in OxLint, stays ESLint-only
    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    // react/self-closing-comp — trimmed: no @eslint-react equivalent (policy: promotion-first, 2026-06-07)
    'react/jsx-curly-brace-presence': ['warn', 'never'],
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/jsx-fragments': ['warn', 'syntax'],
    // react/jsx-pascal-case — trimmed: no @eslint-react equivalent (policy: promotion-first, 2026-06-07)
    // react/jsx-handler-names — trimmed: no @eslint-react equivalent (policy: promotion-first, 2026-06-07)
    // react/jsx-no-duplicate-props — trimmed: no @eslint-react equivalent; @eslint-react only has no-duplicate-key (2026-06-07)
    'react/jsx-no-target-blank': 'warn',
    // react/jsx-no-undef — trimmed: no @eslint-react equivalent (policy: promotion-first, 2026-06-07)
    'react/jsx-no-comment-textnodes': 'warn',
    'react/no-unknown-property': 'warn',
    'react/no-direct-mutation-state': 'error',
    // react/no-is-mounted — trimmed: no @eslint-react equivalent (policy: promotion-first, 2026-06-07)
    'react/no-danger-with-children': 'warn',
    'react/no-children-prop': 'warn',
    'react/no-danger': 'error',
    'react/jsx-no-script-url': 'error',
    'react/iframe-missing-sandbox': 'error',
    'react/button-has-type': 'warn',
    'react/style-prop-object': 'warn'
};
