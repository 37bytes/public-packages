/**
 * @fileoverview Perfectionist auto-sorting rules for OxLint (opt-in)
 *
 * Maps to eslint/rules/perfectionist.js.
 * Loaded via jsPlugins (eslint-plugin-perfectionist).
 * NOT included in recommended — users add explicitly.
 */

export const perfectionistJsPlugin = {
    name: 'perfectionist',
    specifier: 'eslint-plugin-perfectionist'
};

/** Import rules to disable (conflict with perfectionist) */
export const perfectionistImportOverrides = {
    // import/order — not in OxLint (stays ESLint-only, disabled by perfectionist ESLint config)
    'import/first': 'off'
};

/** Perfectionist sorting rules */
export const perfectionist = {
    'perfectionist/sort-imports': [
        'warn',
        {
            type: 'natural',
            order: 'asc',
            ignoreCase: true,
            internalPattern: ['^@/'],
            sortSideEffects: false,
            newlinesBetween: 1,
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'side-effect', 'style']
        }
    ],
    'perfectionist/sort-named-imports': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-named-exports': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-exports': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-import-attributes': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-union-types': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-intersection-types': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-heritage-clauses': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-array-includes': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-variable-declarations': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }]
};
