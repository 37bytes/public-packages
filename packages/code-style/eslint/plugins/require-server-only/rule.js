/**
 * @fileoverview Правило: обязательный import 'server-only' первой строкой в server.ts файлах
 * @author 37bytes
 *
 * Серверный код экспортируется через файлы server.ts (вместо index.ts),
 * чтобы предотвратить утекание серверного кода на клиент.
 * Пакет server-only при попадании в клиентский бандл вызывает ошибку сборки.
 *
 * @see https://www.npmjs.com/package/server-only
 */

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: "Требует import 'server-only' первой строкой в server.ts файлах",
            category: 'FSD Architecture',
            recommended: true,
            url: 'https://github.com/37bytes/code-style'
        },
        fixable: 'code',
        schema: [],
        messages: {
            missingServerOnly:
                'Файл server.ts должен импортировать пакет "server-only" для предотвращения утекания серверного кода на клиент.',
            notFirstImport: "import 'server-only' должен быть первой строкой в файле server.ts."
        }
    },
    create: (context) => {
        const filename = context.filename || context.getFilename();

        if (!filename.endsWith('server.ts')) {
            return {};
        }

        let hasServerOnlyImport = false;
        let serverOnlyNode = null;
        let isFirstStatement = false;

        return {
            ImportDeclaration: (node) => {
                if (node.source.value === 'server-only') {
                    hasServerOnlyImport = true;
                    serverOnlyNode = node;
                    const program = context.sourceCode.ast;
                    isFirstStatement = program.body[0] === node;
                }
            },

            'Program:exit': (node) => {
                if (!hasServerOnlyImport) {
                    context.report({
                        node,
                        messageId: 'missingServerOnly',
                        fix: (fixer) => {
                            const firstNode = node.body[0];
                            if (firstNode) {
                                return fixer.insertTextBefore(firstNode, "import 'server-only';\n\n");
                            }
                            return fixer.insertTextAfter(node, "import 'server-only';\n");
                        }
                    });
                    return;
                }

                if (!isFirstStatement) {
                    context.report({
                        node: serverOnlyNode,
                        messageId: 'notFirstImport',
                        fix: (fixer) => {
                            const importText = context.sourceCode.getText(serverOnlyNode);
                            return [
                                fixer.remove(serverOnlyNode),
                                fixer.insertTextBefore(node.body[0], `${importText}\n\n`)
                            ];
                        }
                    });
                }
            }
        };
    }
};
