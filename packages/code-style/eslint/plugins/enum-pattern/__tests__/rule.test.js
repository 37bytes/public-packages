/**
 * @fileoverview Tests for enum-pattern rule
 */

import { rule } from '#eslint/plugins/enum-pattern/rule';

import { test } from 'node:test';

import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';

test('enum-pattern rule', async (ctx) => {
    const tester = new RuleTester({
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: tsParser
        }
    });

    await ctx.test('should forbid TypeScript enums', () => {
        tester.run('enum-pattern', rule, {
            valid: [],
            invalid: [
                {
                    code: 'enum Status { READY, FAILED }',
                    errors: [{ messageId: 'noEnum' }]
                },
                {
                    code: 'enum Direction { UP = "UP", DOWN = "DOWN" }',
                    errors: [{ messageId: 'noEnum' }]
                },
                {
                    code: 'const enum HttpStatus { OK = 200, NOT_FOUND = 404 }',
                    errors: [{ messageId: 'noEnum' }]
                },
                {
                    code: 'export enum Color { RED, GREEN, BLUE }',
                    errors: [{ messageId: 'noEnum' }]
                }
            ]
        });
    });

    await ctx.test('should suggest SCREAMING_SNAKE_CASE name for enum', () => {
        tester.run('enum-pattern', rule, {
            valid: [],
            invalid: [
                {
                    code: 'enum StatusCode { OK, ERROR }',
                    errors: [
                        {
                            messageId: 'noEnum',
                            data: { suggestion: 'STATUS_CODE' }
                        }
                    ]
                },
                {
                    code: 'enum HTTPMethod { GET, POST }',
                    errors: [
                        {
                            messageId: 'noEnum',
                            data: { suggestion: 'HTTP_METHOD' }
                        }
                    ]
                }
            ]
        });
    });

    await ctx.test('should pass valid SCREAMING_SNAKE_CASE with as const', () => {
        tester.run('enum-pattern', rule, {
            valid: [
                // Correct SCREAMING_SNAKE_CASE
                'const STATUS = { READY: "READY", FAILED: "FAILED" } as const;',
                'const STATUS_CODES = { OK: 200, NOT_FOUND: 404 } as const;',
                'const HTTP_STATUS = { OK: 200 } as const;',
                'const A = { X: 1 } as const;',
                'const A1 = { X: 1 } as const;',
                'const A_1 = { X: 1 } as const;',

                // Regular objects without as const - not checked
                'const status = { ready: true };',
                'const statusCodes = { ok: 200 };',

                // Arrays with as const - not checked (only objects)
                'const values = [1, 2, 3] as const;',

                // Primitives with as const - not checked
                'const value = "hello" as const;',
                'const num = 42 as const;',

                // let/var not checked (only const)
                'let status = { READY: "READY" } as const;'
            ],
            invalid: []
        });
    });

    await ctx.test('should catch wrong naming with as const objects', () => {
        tester.run('enum-pattern', rule, {
            valid: [],
            invalid: [
                {
                    code: 'const status = { READY: "READY", FAILED: "FAILED" } as const;',
                    errors: [{ messageId: 'notScreamingCase' }]
                },
                {
                    code: 'const statusCodes = { OK: 200, NOT_FOUND: 404 } as const;',
                    errors: [
                        {
                            messageId: 'notScreamingCase',
                            data: { suggestion: 'STATUS_CODES' }
                        }
                    ]
                },
                {
                    code: 'const Status = { READY: "READY" } as const;',
                    errors: [{ messageId: 'notScreamingCase' }]
                },
                {
                    code: 'const HttpStatusCodes = { OK: 200 } as const;',
                    errors: [
                        {
                            messageId: 'notScreamingCase',
                            data: { suggestion: 'HTTP_STATUS_CODES' }
                        }
                    ]
                }
            ]
        });
    });
});
