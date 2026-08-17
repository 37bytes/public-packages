/**
 * @fileoverview FSD (Feature-Sliced Design) конфиг для ESLint
 * @author 37bytes
 *
 * Реализует enforcement архитектурной методологии FSD 2.1 с адаптациями 37bytes:
 * — Жёсткие 6 слоёв: app, pages, widgets, features, entities, shared
 * — Public API через index.ts, server.ts, client.ts и @x cross-imports
 * — Порядок импортов по иерархии FSD
 * — Запрет циклических само-импортов слайсов
 * — Обязательный import 'server-only' в server.ts файлах
 *
 * @example
 * // eslint.config.mjs
 * import { nextjs, createFSDConfig } from '@37bytes/code-style/eslint';
 *
 * export default [
 *     ...nextjs,
 *     ...createFSDConfig({
 *         allowPatterns: ['@lingui/**\/*', 'next/*']
 *     })
 * ];
 *
 * @example
 * // Проект уже гоняет dependency-cruiser (createFsdCruiserConfig) в CI:
 * // eslint отдаёт графу направление слоёв и само-импорт (полные дубли), оставляя себе
 * // public API + запрет deep-import во внешние пакеты, порядок, папки-свалки, server/client-only.
 * export default [
 *     ...nextjs,
 *     ...createFSDConfig({ dependencyCruiser: true, allowPatterns: ['next/*'] })
 * ];
 */

import { plugins } from '#plugins';

import importPlugin from 'eslint-plugin-import-x';

/** Слои FSD сверху вниз (от app к shared) */
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

/**
 * Паттерны, всегда разрешённые для import-x/no-internal-modules.
 * Инфраструктурные — не зависят от конкретного проекта.
 */
const DEFAULT_ALLOW_PATTERNS = ['@37bytes/**/*', '**/assets/*', '**/images/*'];

/**
 * Генерирует зоны для import-x/no-restricted-paths.
 * Каждый слой не может импортировать из вышестоящих слоёв.
 *
 * @returns {Array<{ target: string, from: string, message: string }>}
 */
const buildLayerRestrictionZones = () => {
    const zones = [];

    for (let targetIndex = 0; targetIndex < LAYERS.length; targetIndex++) {
        const targetLayer = LAYERS[targetIndex];

        // Запрет импорта из всех вышестоящих слоёв
        for (let fromIndex = 0; fromIndex < targetIndex; fromIndex++) {
            const fromLayer = LAYERS[fromIndex];
            zones.push({
                target: `src/${targetLayer}`,
                from: `src/${fromLayer}`,
                message: `Импорт из слоя '${fromLayer}' в слой '${targetLayer}' запрещён. Слой ${targetLayer} не может зависеть от ${fromLayer}.`
            });
        }
    }

    return zones;
};

/**
 * Генерирует зоны для запрета cross-imports между слайсами одного слоя.
 * Слайсы одного слоя не могут импортировать друг друга напрямую через internal paths.
 *
 * @returns {Array<{ target: string, from: string, message: string }>}
 */
const buildCrossImportZones = () => {
    const slicedLayers = ['pages', 'widgets', 'features', 'entities'];

    return slicedLayers.map((layer) => ({
        target: `src/${layer}/*/**/*`,
        from: `src/${layer}/*/index.ts`,
        message: 'Cross-imports между слайсами одного слоя запрещены. Каждый слайс должен быть изолирован.'
    }));
};

/**
 * Генерирует allow-паттерны для import-x/no-internal-modules.
 * Определяет, какие глубокие импорты разрешены (public API слоёв).
 *
 * @param {string[]} extraPatterns — дополнительные паттерны от проекта
 * @returns {string[]}
 */
const buildAllowPatterns = (extraPatterns = []) => [
    ...DEFAULT_ALLOW_PATTERNS,
    ...extraPatterns,

    // Public API слоёв (первый уровень)
    '@/shared/*',
    '@/widgets/*',
    '@/app/*',
    '@/pages/*',
    '@/entities/*',
    '@/features/*',

    // shared/lib и shared/api — слайсоподобные, разрешён первый уровень вложенности
    '@/shared/lib/*',
    '@/shared/api/*',

    // server/client экспорты (public API)
    '@/shared/lib/*/server',
    '@/shared/lib/*/client',
    '@/shared/lib/*/@x',
    '@/entities/*/server',
    '@/entities/*/client',
    '@/entities/*/@x',
    '@/entities/*/@x/*',
    '@/features/*/server',
    '@/features/*/client',
    '@/features/*/@x',

    // Серверные файлы
    '**/*/server.ts'
];

/**
 * Генерирует конфиг import-x/order с порядком по иерархии FSD.
 *
 * @returns {[string, object]}
 */
const buildImportOrderRule = () => [
    'warn',
    {
        alphabetize: {
            order: 'asc',
            caseInsensitive: true
        },
        'newlines-between': 'always',
        pathGroups: [
            { pattern: '@/app/**', group: 'internal', position: 'after' },
            { pattern: '@/pages/**', group: 'internal', position: 'after' },
            { pattern: '@/widgets/**', group: 'internal', position: 'after' },
            { pattern: '@/features/**', group: 'internal', position: 'after' },
            { pattern: '@/entities/*/@x/**', group: 'internal', position: 'after' },
            { pattern: '@/entities/**', group: 'internal', position: 'after' },
            { pattern: '@/shared/**', group: 'internal', position: 'after' },
            { pattern: './*.module.scss', group: 'index', position: 'after' }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type', 'object', 'unknown']
    }
];

/**
 * Создаёт ESLint flat config для enforcement FSD-архитектуры.
 *
 * Возвращает массив flat config объектов, которые нужно spread'ить
 * в основной массив конфигов: `...createFSDConfig()`.
 *
 * @param {object} [options] — Настройки FSD-конфига. Все параметры опциональны.
 * @param {string[]} [options.allowPatterns] — Дополнительные паттерны для разрешения глубоких импортов
 *     из внешних пакетов. Например: `['@lingui/**\/*', 'next/*', '@sample/**\/*']`.
 *     Объединяются с инфраструктурными паттернами (@37bytes, assets, images).
 * @param {boolean} [options.dependencyCruiser=false] — Проект дополнительно гоняет
 *     `createFsdCruiserConfig` (dependency-cruiser). Когда `true`, из пресета убираются
 *     ДВА правила, которые dependency-cruiser заменяет ПОЛНОСТЬЮ: `import-x/no-restricted-paths`
 *     (направление слоёв) и `@37bytes/no-slice-self-import`. `import-x/no-internal-modules`
 *     НЕ убирается намеренно: dependency-cruiser покрывает лишь его FSD-половину (public API
 *     слайсов), а вторую половину — запрет deep-import в резолвящиеся внешние пакеты
 *     (`пакет/lib/внутренний/файл`) — не покрывает никто в графе. Побочный эффект: FSD-нарушения
 *     public API остаются под двойным контролем (eslint в редакторе + dependency-cruiser в CI),
 *     но это редундантный сигнал на реальном нарушении, а не шум на чистом коде.
 *     ВНИМАНИЕ: передавай флаг, только если реально запускаешь dependency-cruiser в CI,
 *     иначе направление слоёв не проверяет никто.
 * @returns {Array<import('eslint').Linter.Config>} Массив flat config объектов
 */
export const createFSDConfig = (options = {}) => {
    const { allowPatterns = [], dependencyCruiser = false } = options;

    // Правила, которые dependency-cruiser заменяет ПОЛНОСТЬЮ (направление слоёв +
    // само-импорт). При dependencyCruiser: true убираем их из eslint во избежание двойного
    // репорта. no-internal-modules сюда НЕ входит намеренно: dependency-cruiser покрывает
    // только его FSD-половину (public API слайсов), а запрет deep-import в резолвящиеся внешние
    // пакеты не покрывает никто в графе — поэтому оно остаётся включённым всегда (блок 1).
    const graphReplaceableRules = dependencyCruiser
        ? {}
        : {
              // Запрет импортов вверх по иерархии слоёв
              'import-x/no-restricted-paths': [
                  'error',
                  {
                      zones: [...buildLayerRestrictionZones(), ...buildCrossImportZones()]
                  }
              ],

              // Запрет само-импорта слайса через public API
              '@37bytes/no-slice-self-import': 'error'
          };

    return [
        // Блок 1: основные правила FSD
        {
            files: ['**/*.{js,jsx,ts,tsx}'],
            plugins: {
                '@37bytes': plugins,
                'import-x': importPlugin
            },
            rules: {
                ...graphReplaceableRules,

                // Enforcement public API (запрет глубоких импортов в слайсы) И запрет deep-import
                // в потроха внешних пакетов. Двойная роль: dependency-cruiser заменяет только
                // первую, поэтому правило остаётся даже при dependencyCruiser: true.
                'import-x/no-internal-modules': [
                    'error',
                    {
                        allow: buildAllowPatterns(allowPatterns)
                    }
                ],

                // Порядок импортов по иерархии FSD — граф-аналога нет
                'import-x/order': buildImportOrderRule(),

                // Запрет устаревших папок-свалок (constants/, enums/, utils/) — граф-аналога нет
                '@37bytes/no-legacy-folders': 'error'
            }
        },

        // Блок 2: Barrel-файлы — им разрешено импортировать внутренности модуля
        {
            files: ['**/index.ts', '**/server.ts', '**/client.ts'],
            rules: {
                'import-x/no-internal-modules': 'off'
            }
        },

        // Блок 3: api-сегмент — разрешён доступ к внутренностям своего слайса
        {
            files: ['**/entities/*/api/**', '**/features/*/api/**'],
            rules: {
                'import-x/no-internal-modules': 'off'
            }
        },

        // Блок 4: server.ts — обязательный import 'server-only'
        {
            files: ['**/*server.ts'],
            rules: {
                '@37bytes/require-server-only': 'error'
            }
        },

        // Блок 5: client.ts — обязательный import 'client-only'
        {
            files: ['**/*client.ts'],
            rules: {
                '@37bytes/require-client-only': 'error'
            }
        }
    ];
};
