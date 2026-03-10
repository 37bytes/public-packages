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
    'react/self-closing-comp': 'error',
    'react/jsx-curly-brace-presence': ['warn', 'never'],
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-pascal-case': ['warn', { allowAllCaps: true }],
    'react/jsx-handler-names': [
        'error',
        {
            eventHandlerPrefix: 'handle',
            eventHandlerPropPrefix: 'on',
            checkLocalVariables: true,
            checkInlineFunction: true
        }
    ],
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-no-comment-textnodes': 'warn',
    'react/no-unknown-property': 'warn',
    'react/no-direct-mutation-state': 'error',
    'react/no-is-mounted': 'error',
    'react/no-danger-with-children': 'warn',
    'react/no-children-prop': 'warn',
    'react/no-danger': 'error',
    'react/jsx-no-script-url': 'error',
    'react/iframe-missing-sandbox': 'error',
    'react/button-has-type': 'warn',
    'react/style-prop-object': 'warn'
};
