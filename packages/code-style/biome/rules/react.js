/**
 * React rules: react + react-hooks → Biome categories
 *
 * Biome has native React support via the 'react' domain.
 * Rules auto-activate when react is in consumer's package.json.
 *
 * Source: eslint/rules/react.js
 */

export const react = {
    suspicious: {
        noCommentText: 'warn', // react/jsx-no-comment-textnodes
        // noDuplicateJsxProps — trimmed: no @eslint-react equivalent (@eslint-react 4.2.3 only has
        // no-duplicate-key, not jsx-no-duplicate-props); promotion not possible with shipped plugins
        // (policy: no extras, checked 2026-06-07)
        noArrayIndexKey: 'warn' // react/no-array-index-key (inspired)
    },
    style: {
        noImplicitBoolean: 'warn', // react/jsx-boolean-value (inspired)
        useConsistentCurlyBraces: 'warn', // react/jsx-curly-brace-presence (inspired)
        useFragmentSyntax: 'warn' // react/jsx-fragments
    },
    complexity: {
        noUselessFragments: 'warn' // react/jsx-no-useless-fragment
    },
    correctness: {
        useJsxKeyInIterable: 'error', // react/jsx-key
        noChildrenProp: 'warn', // react/no-children-prop
        useExhaustiveDependencies: 'error', // react-hooks/exhaustive-deps (inspired)
        useHookAtTopLevel: 'error', // react-hooks/rules-of-hooks
        noVoidElementsWithChildren: 'error', // react/void-dom-elements-no-children
        noNestedComponentDefinitions: 'error' // @eslint-react/no-nested-component-definitions
    },
    security: {
        noBlankTarget: 'warn', // react/jsx-no-target-blank
        noDangerouslySetInnerHtml: 'error', // react/no-danger
        noDangerouslySetInnerHtmlWithChildren: 'warn' // react/no-danger-with-children (@eslint-react/dom-no-dangerously-set-innerhtml-with-children: warn)
    }
};

/**
 * ESLint React rules with NO Biome equivalent (stay ESLint-only):
 *
 * — react/function-component-definition (arrow functions only)
 * — react/self-closing-comp
 * — react/jsx-curly-newline
 * — react/jsx-pascal-case
 * — react/jsx-sort-props (use perfectionist)
 * — react/boolean-prop-naming
 * — react/jsx-handler-names
 * — react/hook-use-state
 * — react/jsx-no-leaked-render
 * — react/jsx-no-undef
 * — react/no-unknown-property
 * — react/no-direct-mutation-state
 * — react/no-access-state-in-setstate
 * — react/no-unused-state
 * — react/no-is-mounted
 * — react/no-deprecated
 * — react/sort-comp
 * — react/no-adjacent-inline-elements
 * — react/no-object-type-as-default-prop
 * — react/no-typos
 * — react/style-prop-object
 * — react/button-has-type (biome has this in a11y, but we skip a11y)
 * — react/jsx-no-script-url
 * — react/iframe-missing-sandbox
 * — react-hooks/react-compiler rules (15 rules, no biome equivalent)
 */

/**
 * Nursery rules from React that are available in Biome nursery.
 */
export const reactNursery = {
    nursery: {
        noLeakedRender: 'error' // react/jsx-no-leaked-render
    }
};
