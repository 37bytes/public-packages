/**
 * @fileoverview Правила автосортировки (eslint-plugin-perfectionist)
 * @author 37bytes
 *
 * Экспериментальный набор — НЕ входит в recommended.
 * Подключается явно через perfectionistConfig / perfectionistReactConfig.
 *
 * Все правила имеют автофикс. Стратегия: natural (item2 < item10).
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Группа-маркер: пакеты server-only / client-only обязаны быть первым
 * side-effect импортом, иначе RSC-гард не срабатывает. Держим их первой
 * группой в sort-imports, иначе perfectionist конфликтует с
 * @37bytes/require-server-only (тот требует import 'server-only' первой строкой
 * в **\/*server.ts и автофиксит наверх, а sort-imports гнал бы side-effect вниз).
 *
 * @see eslint/plugins/require-server-only/rule.js
 */
const SERVER_BOUNDARY_GROUP = {
    groupName: 'server-boundary',
    selector: 'side-effect',
    elementNamePattern: '^(server-only|client-only)$'
};

/**
 * Накладывает инвариант «server-only / client-only первыми» на любой
 * perfectionist/sort-imports options-объект. Идемпотентна: повторное
 * применение не дублирует группу.
 *
 * Экспортируется для консюмеров, которые переопределяют sort-imports своими
 * группами: flat config не мержит опции правила (поздний конфиг заменяет ранний
 * целиком), поэтому инвариант надо переналожить на собственные опции.
 *
 * @param {object} sortImportsOptions — options-объект perfectionist/sort-imports
 * @returns {object} новый options-объект с server-boundary первой группой
 */
export const withServerBoundaryFirst = (sortImportsOptions) => ({
    ...sortImportsOptions,
    customGroups: [
        SERVER_BOUNDARY_GROUP,
        ...(sortImportsOptions.customGroups ?? []).filter((group) => group.groupName !== 'server-boundary')
    ],
    groups: ['server-boundary', ...sortImportsOptions.groups.filter((group) => group !== 'server-boundary')]
});

/**
 * Базовые правила сортировки (без React/JSX).
 *
 * Входит в `perfectionistConfig`.
 * Покрывает: импорты, экспорты, union/intersection типы, heritage clauses,
 * array.includes(), variable declarations.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const perfectionist = {
    // === Imports ===
    'perfectionist/sort-imports': [
        'warn',
        withServerBoundaryFirst({
            type: 'natural',
            order: 'asc',
            ignoreCase: true,
            internalPattern: ['^@/'],
            sortSideEffects: false,
            newlinesBetween: 1,
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'side-effect', 'style']
        })
    ],
    'perfectionist/sort-named-imports': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-named-exports': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-exports': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-import-attributes': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],

    // === TypeScript Types ===
    'perfectionist/sort-union-types': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-intersection-types': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],

    // === Classes ===
    'perfectionist/sort-heritage-clauses': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],

    // === Other ===
    'perfectionist/sort-array-includes': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }],
    'perfectionist/sort-variable-declarations': ['warn', { type: 'natural', order: 'asc', ignoreCase: true }]
};

/**
 * React-специфичные правила сортировки.
 *
 * Входит в `perfectionistReactConfig`.
 * Покрывает: JSX props (boolean → key → ref → остальное → callbacks),
 * react/next custom groups для sort-imports.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const perfectionistReact = {
    // === JSX Props: boolean → key → ref → rest → callbacks ===
    'perfectionist/sort-jsx-props': [
        'warn',
        {
            type: 'natural',
            order: 'asc',
            ignoreCase: true,
            customGroups: [
                { groupName: 'boolean', modifiers: ['shorthand'] },
                { groupName: 'key', elementNamePattern: '^key$' },
                { groupName: 'ref', elementNamePattern: '^ref$' },
                { groupName: 'callback', elementNamePattern: '^on[A-Z]' }
            ],
            groups: ['boolean', 'key', 'ref', 'unknown', 'callback']
        }
    ],

    // === Imports: react и next выделены в отдельные группы ===
    'perfectionist/sort-imports': [
        'warn',
        withServerBoundaryFirst({
            type: 'natural',
            order: 'asc',
            ignoreCase: true,
            internalPattern: ['^@/'],
            sortSideEffects: false,
            newlinesBetween: 1,
            customGroups: [
                { groupName: 'react', elementNamePattern: '^react(-dom)?$' },
                { groupName: 'next', elementNamePattern: '^next(/.*)?$' }
            ],
            groups: [
                'builtin',
                'react',
                'next',
                'external',
                'internal',
                ['parent', 'sibling', 'index'],
                'side-effect',
                'style'
            ]
        })
    ]
};
