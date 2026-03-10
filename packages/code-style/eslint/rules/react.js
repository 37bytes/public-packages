/**
 * @fileoverview React ESLint rules
 * @author 37bytes
 *
 * Rules for React components, hooks, and JSX.
 * Includes both react-plugin and react-hooks-plugin rules.
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
    // === Hooks Rules (Critical) ===
    'react-hooks/rules-of-hooks': 'error', // https://reactjs.org/docs/hooks-rules.html
    'react-hooks/exhaustive-deps': 'error', // https://reactjs.org/docs/hooks-rules.html

    // === Keys and Lists ===
    'react/jsx-key': [
        'error',
        {
            checkFragmentShorthand: true,
            warnOnDuplicates: true,
            checkKeyMustBeforeSpread: true
        }
    ], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
    'react/no-array-index-key': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md

    // === Component Definition ===
    'react/function-component-definition': [
        'error',
        {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function'
        }
    ], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
    'react/self-closing-comp': ['error', { component: true, html: true }], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md

    // === JSX Syntax ===
    'react/jsx-curly-brace-presence': ['warn', 'never'], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
    'react/jsx-curly-newline': ['error', { multiline: 'forbid', singleline: 'forbid' }], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-newline.md
    'react/jsx-boolean-value': ['warn', 'never'], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md
    'react/jsx-fragments': ['warn', 'syntax'], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-fragments.md
    'react/jsx-pascal-case': ['warn', { allowAllCaps: true, ignore: [] }], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md

    // === Props ===
    'react/jsx-sort-props': [
        'error',
        {
            ignoreCase: true,
            reservedFirst: ['key'],
            shorthandFirst: true,
            noSortAlphabetically: true,
            callbacksLast: true
        }
    ], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-sort-props.md
    'react/jsx-no-duplicate-props': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md

    // === Boolean Props Naming ===
    'react/boolean-prop-naming': [
        'error',
        {
            rule: '^(?!(is|has))[a-z][a-zA-Z]+',
            propTypeNames: ['bool', 'boolean'],
            message:
                "Boolean prop names should follow HTML approach (disabled, readonly). Add 'is' or 'has' during destructuring."
        }
    ], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/boolean-prop-naming.md

    // === Event Handlers ===
    'react/jsx-handler-names': [
        'error',
        {
            eventHandlerPrefix: false,
            eventHandlerPropPrefix: 'on'
        }
    ], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md

    // === useState Hook ===
    'react/hook-use-state': ['error', { allowDestructuredState: true }], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/hook-use-state.md

    // === Conditional Rendering ===
    'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-leaked-render.md

    // === Accessibility and Links ===
    'react/jsx-no-target-blank': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md

    // === Undefined and Usage ===
    'react/jsx-no-undef': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
    'react/jsx-no-comment-textnodes': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-comment-textnodes.md
    'react/no-unknown-property': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md

    // === State Management ===
    'react/no-direct-mutation-state': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-direct-mutation-state.md
    'react/no-access-state-in-setstate': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-access-state-in-setstate.md
    'react/no-unused-state': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-state.md

    // === Component Lifecycle ===
    'react/no-is-mounted': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-is-mounted.md
    'react/no-deprecated': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-deprecated.md
    'react/sort-comp': [
        'warn',
        {
            order: [
                'static-variables',
                'static-methods',
                'instance-variables',
                'lifecycle',
                'everything-else',
                'render'
            ]
        }
    ], // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/sort-comp.md

    // === Dangerous Patterns ===
    'react/no-danger-with-children': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger-with-children.md
    'react/no-adjacent-inline-elements': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-adjacent-inline-elements.md
    'react/no-children-prop': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md
    'react/no-unstable-nested-components': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md
    'react/no-object-type-as-default-prop': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-object-type-as-default-prop.md

    // === Typos ===
    'react/no-typos': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-typos.md

    // === Style ===
    'react/style-prop-object': ['warn', { allow: [] }], // override allow with UI-kit components in your project config

    // === Buttons ===
    'react/button-has-type': 'warn', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/button-has-type.md

    // === Security ===
    'react/no-danger': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger.md
    'react/jsx-no-script-url': 'error', // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-script-url.md
    'react/iframe-missing-sandbox': 'error' // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/iframe-missing-sandbox.md
};
