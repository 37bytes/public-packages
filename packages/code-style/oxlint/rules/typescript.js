/**
 * @fileoverview TypeScript override rules for OxLint
 *
 * Goes into overrides[0] for **\/*.ts, **\/*.tsx.
 * Maps to eslint/rules/typescript.js.
 * Note: OxLint uses 'typescript/' prefix (ESLint uses '@typescript-eslint/').
 * Type-aware rules are included but silently skipped by OxLint (no type-checker).
 */

/** Base JS rules to disable in TypeScript files (TS equivalents take over) */
export const typescriptDisables = {
    'no-undef': 'off',
    'no-dupe-class-members': 'off',
    'no-array-constructor': 'off',
    'no-redeclare': 'off',
    'no-use-before-define': 'off',
    'no-unused-expressions': 'off',
    // NOT disabling no-unused-vars: OxLint has only one no-unused-vars (no typescript/ variant).
    // It works for both JS and TS files, unlike ESLint where core must be disabled for TS.
    'no-useless-constructor': 'off',
    'no-loop-func': 'off',
    'no-throw-literal': 'off'
    // camelcase — not in OxLint, nothing to disable
};

/** TypeScript-specific rules */
export const typescriptRules = {
    'typescript/consistent-type-imports': [
        'error',
        {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
            disallowTypeAnnotations: true
        }
    ],
    'typescript/consistent-type-exports': [
        'error',
        {
            fixMixedExportsWithInlineTypeSpecifier: true
        }
    ],
    'typescript/consistent-type-assertions': 'warn',
    'typescript/no-explicit-any': 'error',
    'typescript/no-empty-object-type': 'error',
    'typescript/no-unsafe-function-type': 'error',
    'typescript/no-wrapper-object-types': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/no-floating-promises': ['error', { ignoreVoid: true }],
    'typescript/no-misused-promises': 'error',
    'typescript/return-await': 'error',
    'typescript/no-implied-eval': 'warn',
    'typescript/only-throw-error': [
        'error',
        {
            allowThrowingAny: false,
            allowThrowingUnknown: true
        }
    ]
};
