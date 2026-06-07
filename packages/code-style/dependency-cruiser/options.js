/**
 * @fileoverview Общие cruise options для пресетов 37bytes.
 *
 * Probe-факты 2026-06-07 (не «оптимизировать»):
 * - tsPreCompilationDeps: true обязателен: иначе TS elide'ит
 *   неиспользуемые и type-импорты и граф молча пустеет.
 * - includeOnly НЕ добавлять: фильтрует рёбра до required-правил
 *   (false positives на server-only) и прячет unresolvable-рёбра.
 */

/**
 * @param {object} [options]
 * @param {string} [options.tsConfigFileName] путь к tsconfig относительно
 *     директории запуска depcruise
 * @returns {object} options-секция конфигурации dependency-cruiser
 */
export const buildCruiserOptions = (options = {}) => {
    const { tsConfigFileName = 'tsconfig.json' } = options;

    return {
        doNotFollow: { path: 'node_modules' },
        tsPreCompilationDeps: true,
        tsConfig: { fileName: tsConfigFileName },
        enhancedResolveOptions: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
        }
    };
};
