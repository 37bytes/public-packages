/**
 * @fileoverview Правила качества кода (eslint-plugin-sonarjs)
 * @author 37bytes
 *
 * Метрики сложности, обнаружение антипаттернов, безопасность.
 * Whitelist-подход: включаем только то, что реально нужно.
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Правила качества кода.
 *
 * Входит в `baseConfig`.
 * Покрывает: сложность, дубликаты, мёртвый код, безопасность секретов.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const quality = {
    // === Complexity ===
    'sonarjs/cognitive-complexity': ['warn', 15],

    // === Code smells: simplification ===
    'sonarjs/no-collapsible-if': 'warn', // if(a) { if(b) {} } → if(a && b) {}
    'sonarjs/prefer-single-boolean-return': 'warn', // if(x) return true; else return false; → return x;
    'sonarjs/no-redundant-jump': 'warn', // useless return/continue/break at end of block

    // === Code smells: duplicates ===
    'sonarjs/no-identical-functions': ['warn', 5], // identical function bodies (min 5 lines)
    'sonarjs/no-duplicated-branches': 'warn', // identical if/else/switch branches
    'sonarjs/no-all-duplicated-branches': 'error', // ALL branches identical — dead condition
    'sonarjs/no-duplicate-in-composite': 'warn', // duplicates in union/intersection types

    // === Bug detection ===
    'sonarjs/no-dead-store': 'error', // assignment never used (deeper than no-unused-vars)
    'sonarjs/no-use-of-empty-return-value': 'error', // using result of void function
    'sonarjs/no-invariant-returns': 'warn', // function always returns same value regardless of conditions
    'sonarjs/no-element-overwrite': 'error', // sequential overwrite: arr[0] = 1; arr[0] = 2;
    'sonarjs/no-collection-size-mischeck': 'error', // arr.length >= 0 (always true)

    // === Dead code & misuse ===
    'sonarjs/no-unused-collection': 'error', // collection filled but never read
    'sonarjs/no-ignored-return': 'error', // ignoring return of immutable method: arr.filter() without assignment
    'sonarjs/new-operator-misuse': 'error', // new with non-constructor or ignoring new result
    'sonarjs/no-gratuitous-expressions': 'error', // condition always true/false (deeper than no-constant-condition)

    // === Security ===
    'sonarjs/no-hardcoded-passwords': 'error', // hardcoded passwords in code
    'sonarjs/no-hardcoded-secrets': 'error' // hardcoded API keys, tokens, etc.
};
