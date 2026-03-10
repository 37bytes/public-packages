/**
 * @fileoverview Правила для регулярных выражений (eslint-plugin-regexp + security)
 * @author 37bytes
 *
 * Все regex-правила собраны в одном месте.
 * eslint-plugin-regexp заменяет ESLint core regex-правила (более умные версии,
 * понимают new RegExp()) и unicorn/better-regex (гранулярные правила вместо одного).
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Правила для регулярных выражений (61 правило).
 *
 * Входит в `baseConfig`.
 * Покрывает: валидность, ReDoS-защита, оптимизация, стиль регулярок.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const regexp = {
    // === ESLint core: replaced by regexp/ equivalents ===
    'no-invalid-regexp': 'off', // replaced by regexp/no-invalid-regexp
    'no-control-regex': 'off', // replaced by regexp/no-control-character
    'no-empty-character-class': 'off', // replaced by regexp/no-empty-character-class
    'no-regex-spaces': 'warn', // no regexp/ equivalent, keep as-is

    // === Unicorn: replaced by regexp/ equivalents ===
    'unicorn/better-regex': 'off', // replaced by granular regexp/ rules (prefer-d, prefer-w, etc.)
    'unicorn/prefer-regexp-test': 'off', // replaced by regexp/prefer-regexp-test (not in recommended, skipped)

    // === Security ===
    'security/detect-non-literal-regexp': 'warn', // dynamic RegExp from user input — potential ReDoS

    // === Possible Errors ===
    'regexp/no-invalid-regexp': 'warn', // invalid regex in new RegExp()
    'regexp/no-empty-character-class': 'warn', // empty [] (smarter than core)
    'regexp/no-control-character': 'warn', // control characters (smarter than core)
    'regexp/strict': 'warn', // strict regex validation (🔧)
    'regexp/no-empty-alternative': 'warn', // empty alternatives a||b
    'regexp/no-empty-capturing-group': 'warn', // capturing group that always captures empty
    'regexp/no-empty-group': 'warn', // empty groups ()
    'regexp/no-empty-lookarounds-assertion': 'warn', // empty lookahead/lookbehind
    'regexp/no-contradiction-with-assertion': 'warn', // elements contradicting assertions (💡)
    'regexp/no-optional-assertion': 'warn', // assertions inside ? quantifier
    'regexp/no-useless-assertions': 'warn', // assertions that always accept/reject (💡)
    'regexp/no-useless-backreference': 'warn', // useless \1
    'regexp/no-potentially-useless-backreference': 'warn', // \1 on potentially unmatched group
    'regexp/no-super-linear-backtracking': 'error', // ReDoS protection! (🔧 autofix)
    'regexp/no-misleading-capturing-group': 'warn', // groups with unexpected behavior (💡)
    'regexp/no-misleading-unicode-character': 'warn', // multi-codepoint characters (🔧)
    'regexp/no-missing-g-flag': 'warn', // missing g flag in matchAll/replaceAll (🔧)
    'regexp/no-dupe-disjunctions': 'warn', // duplicate alternatives a|a (💡)
    'regexp/no-escape-backspace': 'warn', // [\b] escaped backspace (💡)
    'regexp/no-useless-dollar-replacements': 'warn', // useless $1 in replacement string
    'regexp/no-lazy-ends': 'warn', // lazy quantifiers at end (no effect) (💡)

    // === Best Practices: optimization (🔧 autofix) ===
    'regexp/no-dupe-characters-character-class': 'warn', // dupes in [aab] (🔧)
    'regexp/no-useless-character-class': 'warn', // [a] → a (🔧)
    'regexp/no-useless-lazy': 'warn', // unnecessary ? after quantifier (🔧)
    'regexp/no-useless-quantifier': 'warn', // unnecessary {1} (🔧)
    'regexp/no-useless-range': 'warn', // [a-a] → [a] (🔧)
    'regexp/no-useless-two-nums-quantifier': 'warn', // {1,1} → nothing (🔧)
    'regexp/no-useless-flag': 'warn', // unnecessary flags (🔧)
    'regexp/no-trivially-nested-quantifier': 'warn', // (a{2}){3} → a{6} (🔧)
    'regexp/no-trivially-nested-assertion': 'warn', // nested assertions (🔧)
    'regexp/optimal-quantifier-concatenation': 'warn', // optimize concatenations (🔧)

    // === Best Practices: safety & clarity ===
    'regexp/no-legacy-features': 'warn', // ban RegExp.$1, RegExp.lastMatch
    'regexp/no-non-standard-flag': 'warn', // ban non-standard flags
    'regexp/no-obscure-range': 'warn', // obscure ranges [A-z] (includes [\]^_`)
    'regexp/no-invisible-character': 'warn', // invisible characters in regex (🔧)
    'regexp/no-empty-string-literal': 'warn', // empty strings in character classes
    'regexp/no-extra-lookaround-assertions': 'warn', // redundant nested lookaround (🔧)
    'regexp/confusing-quantifier': 'warn', // confusing quantifiers
    'regexp/optimal-lookaround-quantifier': 'warn', // non-constant quantifiers in lookaround (💡)
    'regexp/control-character-escape': 'warn', // proper escape of control chars (🔧)
    'regexp/negation': 'warn', // proper escape of negation (🔧)
    'regexp/no-unused-capturing-group': 'warn', // unused capturing groups (🔧)
    'regexp/no-zero-quantifier': 'warn', // quantifiers with max 0 (💡)
    'regexp/no-useless-set-operand': 'warn', // unnecessary set operands (🔧)
    'regexp/no-useless-string-literal': 'warn', // single-char disjunctions in \q{} (🔧)
    'regexp/prefer-predefined-assertion': 'warn', // prefer \b, ^, $ over lookaround (🔧)

    // === Stylistic: recommended ===
    'regexp/match-any': 'warn', // consistent match-any: [\s\S] vs . with s-flag (🔧)
    'regexp/no-useless-escape': 'warn', // unnecessary escapes in regex (🔧)
    'regexp/no-useless-non-capturing-group': 'warn', // unnecessary (?:a) (🔧)
    'regexp/prefer-character-class': 'warn', // [abc] instead of a|b|c (🔧)
    'regexp/prefer-d': 'warn', // \d instead of [0-9] (🔧)
    'regexp/prefer-w': 'warn', // \w instead of [a-zA-Z0-9_] (🔧)
    'regexp/prefer-plus-quantifier': 'warn', // + instead of {1,} (🔧)
    'regexp/prefer-question-quantifier': 'warn', // ? instead of {0,1} (🔧)
    'regexp/prefer-star-quantifier': 'warn', // * instead of {0,} (🔧)
    'regexp/prefer-unicode-codepoint-escapes': 'warn', // \u{xxxx} instead of \uxxxx (🔧)
    'regexp/prefer-range': 'warn', // ranges in character classes (🔧)
    'regexp/prefer-set-operation': 'warn', // set operations in character classes (🔧)
    'regexp/simplify-set-operations': 'warn', // simplify set operations (🔧)
    'regexp/sort-flags': 'warn', // sorted flags gimsuy (🔧)
    'regexp/use-ignore-case': 'warn' // use i flag if it simplifies pattern (🔧)
};
