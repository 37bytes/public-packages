/**
 * @fileoverview Конфиг ограничения импортов для ESLint
 * @author 37bytes
 */

/** Дефолтные запрещённые импорты */
const DEFAULT_PATHS = [
    {
        name: 'react',
        importNames: ['FC'],
        message: 'Используйте FunctionComponent вместо FC.'
    }
];

/** Дефолтные glob-паттерны файлов, где разрешены devDependencies */
const DEFAULT_DEV_DEPENDENCIES = [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.stories.ts',
    '**/*.stories.tsx',
    '.storybook/**/*'
];

/**
 * Создаёт ESLint flat config для ограничения импортов.
 *
 * Использует @typescript-eslint/no-restricted-imports вместо встроенного —
 * поддерживает allowTypeImports для раздельного контроля type/runtime импортов.
 *
 * @param {object} [options] — Настройки
 * @param {Array<{name: string, importNames?: string[], message: string, allowTypeImports?: boolean}>} [options.paths]
 *     — Дополнительные запрещённые импорты.
 *       Например: `[{ name: 'clsx', message: 'Используйте @/shared/lib/classNames' }]`
 * @param {string[]} [options.devDependencies]
 *     — Дополнительные glob-паттерны файлов, где разрешены devDependencies.
 *       Например: `['**\/*.e2e.ts']`. Объединяются с дефолтными (тесты, stories).
 * @returns {Array<import('eslint').Linter.Config>}
 */
export const createRestrictedImportsConfig = (options = {}) => {
    const { paths = [], devDependencies = [] } = options;

    return [
        {
            files: ['**/*.{ts,tsx}'],
            rules: {
                '@typescript-eslint/no-restricted-imports': [
                    'error',
                    {
                        paths: [...DEFAULT_PATHS, ...paths]
                    }
                ],
                'import-x/no-extraneous-dependencies': [
                    'error',
                    {
                        devDependencies: [...DEFAULT_DEV_DEPENDENCIES, ...devDependencies]
                    }
                ]
            }
        }
    ];
};
