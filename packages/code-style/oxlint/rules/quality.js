/**
 * @fileoverview Code quality rules for OxLint (sonarjs)
 *
 * Maps to eslint/rules/quality.js.
 * Loaded via jsPlugins (eslint-plugin-sonarjs).
 */

export const quality = {
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/no-collapsible-if': 'warn',
    'sonarjs/prefer-single-boolean-return': 'warn',
    'sonarjs/no-redundant-jump': 'warn',
    'sonarjs/no-identical-functions': ['warn', 5],
    'sonarjs/no-duplicated-branches': 'warn',
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-duplicate-in-composite': 'warn',
    'sonarjs/no-dead-store': 'error',
    'sonarjs/no-use-of-empty-return-value': 'error',
    'sonarjs/no-invariant-returns': 'warn',
    'sonarjs/no-element-overwrite': 'error',
    'sonarjs/no-collection-size-mischeck': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-ignored-return': 'error',
    'sonarjs/new-operator-misuse': 'error',
    'sonarjs/no-gratuitous-expressions': 'error',
    'sonarjs/no-hardcoded-passwords': 'error',
    'sonarjs/no-hardcoded-secrets': 'error'
};
