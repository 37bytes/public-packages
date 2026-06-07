/**
 * @fileoverview FSD-пресет dependency-cruiser: графовая половина FSD 2.1
 * в адаптации 37bytes. Зеркалит eslint/fsd.js там, где норма выражается
 * рёбрами графа; НЕ заменяет eslint-пресет (специфаеры, порядок импортов,
 * server-only первой строкой, no-legacy-folders остаются в eslint).
 *
 * dependency-cruiser ВНЕ parity-домена: у biome/oxlint нет аналогов
 * граф-правил, promotion-first сюда не применяется (см. AGENTS.md).
 *
 * @example
 * // .dependency-cruiser.mjs
 * import { createFsdCruiserConfig } from '@37bytes/code-style/dependency-cruiser';
 * export default createFsdCruiserConfig();
 */

import { buildBaseRules } from './base.js';
import { buildCruiserOptions } from './options.js';

/**
 * Слои со слайсами (исключая app и shared).
 * Скобки намеренны: эта группа становится $1 в to-side backreferences правил.
 */
const SLICED_LAYERS = '(pages|widgets|features|entities)';

/**
 * @param {object} [options]
 * @param {string} [options.sourceRoot] корень исходников относительно
 *     директории запуска depcruise (default 'src'). Literal-путь без
 *     regex-спецсимволов: значение подставляется в регексы правил как есть.
 * @param {string} [options.tsConfigFileName] см. buildCruiserOptions
 * @param {boolean} [options.includeBaseRules] добавить ли base-пресет (default true)
 * @param {string[]} [options.extraPublicApiPatterns] дополнительные
 *     regex-паттерны (синтаксис pathNot), разрешающие глубокие импорты;
 *     аналог allowPatterns у createFSDConfig
 * @returns {object} полная конфигурация dependency-cruiser
 */
export const createFsdCruiserConfig = (options = {}) => {
    const { sourceRoot = 'src', tsConfigFileName, includeBaseRules = true, extraPublicApiPatterns = [] } = options;

    const root = `^${sourceRoot}/`;

    /** Public API слайса: index / server / client / @x.
     *  Probe-факт: вложенные квантификаторы запрещены safe-regex гардом,
     *  поэтому форма '@x/' вместо '@x(/.+)?$'. */
    const slicePublicApi = [
        `${root}${SLICED_LAYERS}/[^/]+/(index\\.tsx?|server\\.ts|client\\.ts)$`,
        `${root}${SLICED_LAYERS}/[^/]+/@x/`,
        ...extraPublicApiPatterns
    ];

    const fsdRules = [
        {
            name: 'layers-shared-up',
            comment: 'shared не зависит ни от какого слоя выше',
            severity: 'error',
            from: { path: `${root}shared/` },
            to: { path: `${root}(app|pages|widgets|features|entities)/` }
        },
        {
            name: 'layers-entities-up',
            comment: 'entities зависит только от shared',
            severity: 'error',
            from: { path: `${root}entities/` },
            to: { path: `${root}(app|pages|widgets|features)/` }
        },
        {
            name: 'layers-features-up',
            comment: 'features зависит только от entities и shared',
            severity: 'error',
            from: { path: `${root}features/` },
            to: { path: `${root}(app|pages|widgets)/` }
        },
        {
            name: 'layers-widgets-up',
            comment: 'widgets зависит только от features, entities и shared',
            severity: 'error',
            from: { path: `${root}widgets/` },
            to: { path: `${root}(app|pages)/` }
        },
        {
            name: 'layers-pages-up',
            comment: 'pages не зависит от app',
            severity: 'error',
            from: { path: `${root}pages/` },
            to: { path: `${root}app/` }
        },
        // from-группы: $1 = слой (SLICED_LAYERS), $2 = слайс ([^/]+); в no-cross-segment добавляется $3 = сегмент
        {
            name: 'no-cross-slice',
            // Намеренное двойное покрытие с no-deep-into-slice-from-slice на глубоких кросс-слайс рёбрах: это правило ловит любой кросс-импорт чужого слайса, second правило конкретизирует "только через public API"
            comment: 'Слайсы одного слоя изолированы (кросс-импорт только через @x)',
            severity: 'error',
            from: { path: `${root}${SLICED_LAYERS}/([^/]+)/` },
            to: {
                path: `${root}$1/`,
                pathNot: [`${root}$1/$2/`, `${root}$1/[^/]+/@x(/|$)`]
            }
        },
        {
            name: 'no-deep-into-slice-from-slice',
            comment: 'Внутрь чужого слайса только через public API (index/server/client/@x)',
            severity: 'error',
            from: { path: `${root}${SLICED_LAYERS}/([^/]+)/` },
            to: {
                path: `${root}${SLICED_LAYERS}/[^/]+/.+`,
                pathNot: [`${root}$1/$2/`, ...slicePublicApi]
            }
        },
        {
            name: 'no-deep-into-slice-from-flat',
            comment: 'app и shared тоже ходят в слайсы только через public API',
            severity: 'error',
            from: { path: `${root}(app|shared)/` },
            to: {
                path: `${root}${SLICED_LAYERS}/[^/]+/.+`,
                pathNot: slicePublicApi
            }
        },
        {
            name: 'no-deep-into-shared',
            comment: 'shared: lib и api открыты на втором уровне, остальное через index',
            severity: 'error',
            from: { path: root, pathNot: `${root}shared/` },
            to: {
                path: `${root}shared/[^/]+/.+`,
                pathNot: [
                    `${root}shared/[^/]+/index\\.tsx?$`,
                    `${root}shared/(lib|api)/[^/]+\\.tsx?$`,
                    `${root}shared/(lib|api)/[^/]+/index\\.tsx?$`,
                    `${root}shared/lib/[^/]+/(server|client)\\.ts$`,
                    `${root}shared/lib/[^/]+/@x/`,
                    ...extraPublicApiPatterns
                ]
            }
        },
        {
            name: 'no-slice-self-import',
            comment: 'Слайс не импортирует собственный public API (скрытый цикл)',
            severity: 'error',
            from: { path: `${root}${SLICED_LAYERS}/([^/]+)/` },
            to: { path: `${root}$1/$2/(index\\.tsx?|server\\.ts|client\\.ts)$` }
        },
        {
            name: 'no-cross-segment',
            comment:
                'Сегменты внутри слайса изолированы; api-сегмент entities/features освобождён (severity error: решение Д. 2026-06-07)',
            severity: 'error',
            from: {
                path: `${root}${SLICED_LAYERS}/([^/]+)/([^/]+)/`,
                pathNot: `${root}(entities|features)/[^/]+/api/`
            },
            to: {
                path: `${root}$1/$2/[^/]+/.+`,
                pathNot: `${root}$1/$2/$3/`
            }
        }
    ];

    const requiredRules = [
        {
            name: 'require-server-only',
            comment:
                "server.ts обязан импортировать 'server-only' (паттерн ловит и установленный пакет, и raw-специфаер)",
            severity: 'error',
            module: { path: '(^|/)server\\.ts$' },
            to: { path: '(^|/)server-only(/|$)' }
        },
        {
            name: 'require-client-only',
            comment: "client.ts обязан импортировать 'client-only'",
            severity: 'error',
            module: { path: '(^|/)client\\.ts$' },
            to: { path: '(^|/)client-only(/|$)' }
        }
    ];

    return {
        forbidden: includeBaseRules ? [...fsdRules, ...buildBaseRules()] : fsdRules,
        required: requiredRules,
        options: buildCruiserOptions({ tsConfigFileName })
    };
};
