/**
 * @fileoverview Правило запрещает импорт слайса через его public API изнутри самого слайса
 * @author 37bytes
 *
 * Файл внутри слайса (например entities/user/api/getUser.ts) не должен
 * импортировать свой слайс через алиас (@/entities/user), так как это
 * создаёт циклическую зависимость через barrel-файл (index.ts).
 * Вместо этого нужно использовать относительные импорты (../model/types).
 *
 * Исключение: barrel-файлы (index.ts, server.ts, client.ts) — им разрешено
 * импортировать внутренности слайса, это их прямая задача.
 */

import path from 'node:path';

/** Слои FSD, содержащие слайсы */
const SLICED_LAYERS = new Set(['entities', 'features', 'widgets', 'pages']);

/** Сегменты shared, имеющие слайсоподобную структуру */
const SHARED_SLICE_LIKE_SEGMENTS = new Set(['lib', 'api']);

/** Имена barrel-файлов, которым разрешён импорт public API своего слайса */
const BARREL_FILES = new Set(['index.ts', 'index.js', 'index.tsx', 'server.ts', 'client.ts']);

/**
 * Определяет слайс, в котором находится файл.
 * Возвращает { layer, slice, aliasPrefix } или null, если файл вне слайса.
 *
 * @param {string} filePath — абсолютный путь к файлу
 * @returns {{ layer: string, slice: string, aliasPrefix: string } | null}
 */
const getSliceInfo = (filePath) => {
    const normalized = filePath.replaceAll('\\', '/');

    // Ищем паттерн src/<layer>/<slice>/
    const srcIndex = normalized.lastIndexOf('/src/');
    if (srcIndex === -1) {
        return null;
    }

    const afterSource = normalized.slice(Math.max(0, srcIndex + 5)); // после "/src/"
    const parts = afterSource.split('/');

    if (parts.length < 2) {
        return null;
    }

    const layer = parts[0];
    const slice = parts[1];

    // Обычные слайсовые слои: entities/user, features/auth, etc.
    if (SLICED_LAYERS.has(layer)) {
        return {
            layer,
            slice,
            aliasPrefix: `@/${layer}/${slice}`
        };
    }

    // shared/lib/* и shared/api/* — слайсоподобные
    if (layer === 'shared' && SHARED_SLICE_LIKE_SEGMENTS.has(slice) && parts.length >= 3) {
        const subSlice = parts[2];
        return {
            layer: `shared/${slice}`,
            slice: subSlice,
            aliasPrefix: `@/shared/${slice}/${subSlice}`
        };
    }

    return null;
};

/**
 * Проверяет, является ли файл barrel-файлом (index.ts, server.ts, client.ts)
 *
 * @param {string} filePath — абсолютный путь к файлу
 * @returns {boolean}
 */
const isBarrelFile = (filePath) => {
    const fileName = path.basename(filePath);
    return BARREL_FILES.has(fileName);
};

/**
 * Проверяет, является ли импорт обращением к public API своего слайса.
 * Учитывает: @/layer/slice, @/layer/slice/server, @/layer/slice/client
 *
 * @param {string} importPath — путь из import declaration
 * @param {string} aliasPrefix — алиас-префикс слайса (@/entities/user)
 * @returns {boolean}
 */
const isSelfImport = (importPath, aliasPrefix) => {
    if (importPath === aliasPrefix) {
        return true;
    }

    // @/entities/user/server или @/entities/user/client
    if (importPath === `${aliasPrefix}/server` || importPath === `${aliasPrefix}/client`) {
        return true;
    }

    return false;
};

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Запрещает импорт слайса через public API изнутри самого слайса (предотвращает циклические зависимости)',
            category: 'FSD Architecture',
            recommended: true,
            url: 'https://github.com/37bytes/code-style'
        },
        messages: {
            noSliceSelfImport:
                'Импорт слайса «{{ slice }}» через его public API ({{ importPath }}) изнутри самого слайса создаёт циклическую зависимость. Используйте относительный импорт.'
        },
        schema: [],
        fixable: null
    },
    create: (context) => {
        const filePath = context.filename || context.getFilename();
        const sliceInfo = getSliceInfo(filePath);

        // Файл не в слайсе — правило не применяется
        if (!sliceInfo) {
            return {};
        }

        // Barrel-файлы освобождены — они и есть public API
        if (isBarrelFile(filePath)) {
            return {};
        }

        return {
            ImportDeclaration: (node) => {
                const importPath = node.source.value;

                if (isSelfImport(importPath, sliceInfo.aliasPrefix)) {
                    context.report({
                        node: node.source,
                        messageId: 'noSliceSelfImport',
                        data: {
                            slice: sliceInfo.slice,
                            importPath
                        }
                    });
                }
            },

            // Также проверяем export ... from '...'
            ExportNamedDeclaration: (node) => {
                if (!node.source) {
                    return;
                }

                const importPath = node.source.value;

                if (isSelfImport(importPath, sliceInfo.aliasPrefix)) {
                    context.report({
                        node: node.source,
                        messageId: 'noSliceSelfImport',
                        data: {
                            slice: sliceInfo.slice,
                            importPath
                        }
                    });
                }
            },

            ExportAllDeclaration: (node) => {
                if (!node.source) {
                    return;
                }

                const importPath = node.source.value;

                if (isSelfImport(importPath, sliceInfo.aliasPrefix)) {
                    context.report({
                        node: node.source,
                        messageId: 'noSliceSelfImport',
                        data: {
                            slice: sliceInfo.slice,
                            importPath
                        }
                    });
                }
            }
        };
    }
};
