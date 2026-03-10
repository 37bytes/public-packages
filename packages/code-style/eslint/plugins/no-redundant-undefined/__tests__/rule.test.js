import { test } from 'node:test';

import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';

import { rule } from '../rule.js';

test('no-redundant-undefined rule', async (ctx) => {
    const tester = new RuleTester({
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: tsParser
        }
    });

    await ctx.test('should allow optional properties without undefined', () => {
        tester.run('no-redundant-undefined', rule, {
            valid: [
                'interface A { name?: string }',
                'interface A { name?: string | number }',
                'type A = { name?: string }',
                // Non-optional with undefined is fine (explicit intent)
                'interface A { name: string | undefined }',
                'type A = { name: string | undefined }'
            ],
            invalid: []
        });
    });

    await ctx.test('should report optional properties with redundant undefined', () => {
        tester.run('no-redundant-undefined', rule, {
            valid: [],
            invalid: [
                {
                    code: 'interface A { name?: string | undefined }',
                    output: 'interface A { name?: string }',
                    errors: [{ messageId: 'propertyOptionalError' }]
                },
                {
                    code: 'type A = { name?: string | undefined }',
                    output: 'type A = { name?: string }',
                    errors: [{ messageId: 'propertyOptionalError' }]
                },
                {
                    code: 'interface A { name?: string | number | undefined }',
                    output: 'interface A { name?: string | number }',
                    errors: [{ messageId: 'propertyOptionalError' }]
                },
                {
                    code: 'interface A { name?: undefined | string }',
                    output: 'interface A { name?: string }',
                    errors: [{ messageId: 'propertyOptionalError' }]
                }
            ]
        });
    });

    await ctx.test('should handle optional property with only undefined type', () => {
        tester.run('no-redundant-undefined', rule, {
            valid: [],
            invalid: [
                {
                    code: 'interface A { name?: undefined }',
                    output: 'interface A { name? }',
                    errors: [{ messageId: 'propertyOptionalError' }]
                }
            ]
        });
    });

    await ctx.test('should allow optional parameters without undefined', () => {
        tester.run('no-redundant-undefined', rule, {
            valid: [
                'function foo(arg?: string) {}',
                'const foo = (arg?: string) => {}',
                'const foo = (arg?: string | number) => {}',
                // Non-optional with undefined is fine
                'function foo(arg: string | undefined) {}'
            ],
            invalid: []
        });
    });

    await ctx.test('should report optional parameters with redundant undefined', () => {
        tester.run('no-redundant-undefined', rule, {
            valid: [],
            invalid: [
                {
                    code: 'function foo(arg?: string | undefined) {}',
                    output: 'function foo(arg?: string) {}',
                    errors: [{ messageId: 'parameterOptionalError' }]
                },
                {
                    code: 'const foo = (arg?: string | undefined) => {}',
                    output: 'const foo = (arg?: string) => {}',
                    errors: [{ messageId: 'parameterOptionalError' }]
                },
                {
                    code: 'function foo(arg?: number | string | undefined) {}',
                    output: 'function foo(arg?: number | string) {}',
                    errors: [{ messageId: 'parameterOptionalError' }]
                }
            ]
        });
    });

    await ctx.test('should handle class properties', () => {
        tester.run('no-redundant-undefined', rule, {
            valid: ['class A { name?: string }', 'class A { name: string | undefined }'],
            invalid: [
                {
                    code: 'class A { name?: string | undefined }',
                    output: 'class A { name?: string }',
                    errors: [{ messageId: 'propertyOptionalError' }]
                }
            ]
        });
    });
});
