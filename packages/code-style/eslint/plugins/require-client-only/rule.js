/**
 * @fileoverview Правило: обязательный import 'client-only' первой строкой в client.ts файлах
 * @author 37bytes
 *
 * Клиентский код экспортируется через файлы client.ts (вместо index.ts),
 * чтобы предотвратить использование клиентского кода на сервере.
 * Пакет client-only при попадании в серверный бандл вызывает ошибку сборки.
 *
 * @see https://www.npmjs.com/package/client-only
 */

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: "Требует import 'client-only' первой строкой в client.ts файлах",
            category: 'FSD Architecture',
            recommended: true,
            url: 'https://github.com/37bytes/code-style'
        },
        fixable: 'code',
        schema: [],
        messages: {
            missingClientOnly:
                'Файл client.ts должен импортировать пакет "client-only" для предотвращения использования клиентского кода на сервере.',
            notFirstImport: "import 'client-only' должен быть первой строкой в файле client.ts."
        }
    },
    create: (context) => {
        const filename = context.filename || context.getFilename();

        if (!filename.endsWith('client.ts')) {
            return {};
        }

        let hasClientOnlyImport = false;
        let clientOnlyNode = null;
        let isFirstStatement = false;

        return {
            ImportDeclaration: (node) => {
                if (node.source.value === 'client-only') {
                    hasClientOnlyImport = true;
                    clientOnlyNode = node;
                    const program = context.sourceCode.ast;
                    isFirstStatement = program.body[0] === node;
                }
            },

            'Program:exit': (node) => {
                if (!hasClientOnlyImport) {
                    context.report({
                        node,
                        messageId: 'missingClientOnly',
                        fix: (fixer) => {
                            const firstNode = node.body[0];
                            if (firstNode) {
                                return fixer.insertTextBefore(firstNode, "import 'client-only';\n\n");
                            }
                            return fixer.insertTextAfter(node, "import 'client-only';\n");
                        }
                    });
                    return;
                }

                if (!isFirstStatement) {
                    context.report({
                        node: clientOnlyNode,
                        messageId: 'notFirstImport',
                        fix: (fixer) => {
                            const importText = context.sourceCode.getText(clientOnlyNode);
                            return [
                                fixer.remove(clientOnlyNode),
                                fixer.insertTextBefore(node.body[0], `${importText}\n\n`)
                            ];
                        }
                    });
                }
            }
        };
    }
};
