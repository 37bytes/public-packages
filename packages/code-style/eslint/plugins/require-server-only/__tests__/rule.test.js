/**
 * @fileoverview Tests for require-server-only rule
 */

import { test } from 'node:test';

import { RuleTester } from 'eslint';

import { rule } from '../rule.js';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
});

test('require-server-only: разрешённые случаи', async (ctx) => {
    await ctx.test('server.ts с import server-only первой строкой — ок', () => {
        tester.run('require-server-only', rule, {
            valid: [
                {
                    code: "import 'server-only';\n\nexport const getUser = () => {};",
                    filename: '/project/src/entities/user/server.ts'
                },
                {
                    code: "import 'server-only';\nimport { db } from '../db';\n\nexport const query = () => {};",
                    filename: '/project/src/shared/api/server.ts'
                }
            ],
            invalid: []
        });
    });

    await ctx.test('не-server.ts файлы — правило не применяется', () => {
        tester.run('require-server-only', rule, {
            valid: [
                {
                    code: 'export const user = {};',
                    filename: '/project/src/entities/user/index.ts'
                },
                {
                    code: "import { useState } from 'react';",
                    filename: '/project/src/entities/user/client.ts'
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

test('require-server-only: запрещённые случаи', async (ctx) => {
    await ctx.test('server.ts без import server-only', () => {
        tester.run('require-server-only', rule, {
            valid: [],
            invalid: [
                {
                    code: 'export const getUser = () => {};',
                    filename: '/project/src/entities/user/server.ts',
                    errors: [{ messageId: 'missingServerOnly' }],
                    output: "import 'server-only';\n\nexport const getUser = () => {};"
                }
            ]
        });
    });

    await ctx.test('server.ts с import server-only не первой строкой', () => {
        tester.run('require-server-only', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { db } from '../db';\nimport 'server-only';",
                    filename: '/project/src/entities/user/server.ts',
                    errors: [{ messageId: 'notFirstImport' }],
                    output: "import 'server-only';\n\nimport { db } from '../db';\n"
                }
            ]
        });
    });

    await ctx.test('пустой server.ts — должен добавить import', () => {
        tester.run('require-server-only', rule, {
            valid: [],
            invalid: [
                {
                    code: '',
                    filename: '/project/src/entities/user/server.ts',
                    errors: [{ messageId: 'missingServerOnly' }],
                    output: "import 'server-only';\n"
                }
            ]
        });
    });
});
