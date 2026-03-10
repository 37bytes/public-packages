/**
 * @fileoverview Запрещает использование устаревших папок-свалок по типу данных
 * @author 37bytes
 *
 * В FSD-архитектуре код группируется по доменной ответственности, а не по
 * техническому типу. Папки вроде constants/, enums/, utils/ — антипаттерн,
 * их содержимое должно быть распределено по сегментам (model/, lib/, config/).
 */

/** Запрещённые имена папок */
const DEFAULT_FORBIDDEN = ['constants', 'enums', 'utils'];

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Запрещает размещение файлов в папках-свалках (constants/, enums/, utils/)',
            category: 'FSD Architecture',
            recommended: true,
            url: 'https://github.com/37bytes/code-style'
        },
        messages: {
            noLegacyFolder:
                'Папка «{{ folder }}/» запрещена. Распределите содержимое по сегментам: model/, lib/, config/ и т.д.'
        },
        schema: [
            {
                type: 'object',
                properties: {
                    folders: {
                        type: 'array',
                        items: { type: 'string' },
                        uniqueItems: true
                    }
                },
                additionalProperties: false
            }
        ],
        fixable: null
    },
    create: (context) => {
        const options = context.options[0] || {};
        const forbidden = options.folders || DEFAULT_FORBIDDEN;

        const filePath = context.filename || context.getFilename();
        const normalized = filePath.replaceAll('\\', '/');

        const segments = normalized.split('/');
        const match = segments.find((segment) => forbidden.includes(segment));

        if (!match) {
            return {};
        }

        return {
            Program: (node) => {
                context.report({
                    node,
                    messageId: 'noLegacyFolder',
                    data: { folder: match }
                });
            }
        };
    }
};
