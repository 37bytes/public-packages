/**
 * Code quality rules: sonarjs → Biome categories
 *
 * Only 2 of 20 sonarjs rules have Biome equivalents.
 * The rest stay ESLint-only.
 *
 * Source: eslint/rules/quality.js
 */

export const quality = {
    complexity: {
        noExcessiveCognitiveComplexity: {
            // sonarjs/cognitive-complexity (inspired)
            level: 'warn',
            options: { maxAllowedComplexity: 15 }
        }
    }
};

/**
 * ESLint quality rules with NO Biome equivalent (stay ESLint-only):
 *
 * — sonarjs/no-collapsible-if
 * — sonarjs/prefer-single-boolean-return
 * — sonarjs/no-redundant-jump
 * — sonarjs/no-identical-functions
 * — sonarjs/no-duplicated-branches
 * — sonarjs/no-all-duplicated-branches
 * — sonarjs/no-duplicate-in-composite
 * — sonarjs/no-dead-store
 * — sonarjs/no-use-of-empty-return-value
 * — sonarjs/no-invariant-returns
 * — sonarjs/no-element-overwrite
 * — sonarjs/no-collection-size-mischeck
 * — sonarjs/no-unused-collection
 * — sonarjs/no-ignored-return
 * — sonarjs/new-operator-misuse
 * — sonarjs/no-gratuitous-expressions
 * — sonarjs/no-hardcoded-passwords
 * — sonarjs/no-hardcoded-secrets
 */
