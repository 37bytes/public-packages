/**
 * @fileoverview Tests for require-client-only rule
 */

import { rule } from '#eslint/plugins/require-client-only/rule';

import { test } from 'node:test';

import { RuleTester } from 'eslint';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
});

test('require-client-only: разрешённые случаи', async (ctx) => {
    await ctx.test('client.ts с import client-only первой строкой — ок', () => {
        tester.run('require-client-only', rule, {
            valid: [
                {
                    code: "import 'client-only';\n\nexport const useUser = () => {};",
                    filename: '/project/src/entities/user/client.ts'
                },
                {
                    code: "import 'client-only';\nimport { useState } from 'react';\n\nexport const hook = () => {};",
                    filename: '/project/src/shared/lib/hooks/client.ts'
                }
            ],
            invalid: []
        });
    });

    await ctx.test('не-client.ts файлы — правило не применяется', () => {
        tester.run('require-client-only', rule, {
            valid: [
                {
                    code: 'export const user = {};',
                    filename: '/project/src/entities/user/index.ts'
                },
                {
                    code: "import 'server-only';",
                    filename: '/project/src/entities/user/server.ts'
                },
                {
                    code: 'export const Component = () => null;',
                    filename: '/project/src/entities/user/ui/UserCard.tsx'
                }
            ],
            invalid: []
        });
    });
});

test('require-client-only: запрещённые случаи', async (ctx) => {
    await ctx.test('client.ts без import client-only', () => {
        tester.run('require-client-only', rule, {
            valid: [],
            invalid: [
                {
                    code: 'export const useUser = () => {};',
                    filename: '/project/src/entities/user/client.ts',
                    errors: [{ messageId: 'missingClientOnly' }],
                    output: "import 'client-only';\n\nexport const useUser = () => {};"
                }
            ]
        });
    });

    await ctx.test('client.ts с import client-only не первой строкой', () => {
        tester.run('require-client-only', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { useState } from 'react';\nimport 'client-only';",
                    filename: '/project/src/entities/user/client.ts',
                    errors: [{ messageId: 'notFirstImport' }],
                    output: "import 'client-only';\n\nimport { useState } from 'react';\n"
                }
            ]
        });
    });

    await ctx.test('пустой client.ts — должен добавить import', () => {
        tester.run('require-client-only', rule, {
            valid: [],
            invalid: [
                {
                    code: '',
                    filename: '/project/src/entities/user/client.ts',
                    errors: [{ messageId: 'missingClientOnly' }],
                    output: "import 'client-only';\n"
                }
            ]
        });
    });
});
