/**
 * @fileoverview Tests for no-legacy-folders rule
 */

import { rule } from '#eslint/plugins/no-legacy-folders/rule';

import { describe, test } from 'node:test';

import { RuleTester } from 'eslint';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
});

describe('no-legacy-folders', () => {
    test('should error on constants/ folder', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [],
            invalid: [
                {
                    code: "export const API_URL = 'https://api.example.com';",
                    filename: '/project/src/shared/constants/api.ts',
                    errors: [{ messageId: 'noLegacyFolder', data: { folder: 'constants' } }]
                }
            ]
        });
    });

    test('should error on enums/ folder', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [],
            invalid: [
                {
                    code: "export const STATUS = { ACTIVE: 'active' };",
                    filename: '/project/src/entities/user/enums/status.ts',
                    errors: [{ messageId: 'noLegacyFolder', data: { folder: 'enums' } }]
                }
            ]
        });
    });

    test('should error on utils/ folder', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [],
            invalid: [
                {
                    code: 'export function formatDate(date) { return date.toISOString(); }',
                    filename: '/project/src/shared/utils/date.ts',
                    errors: [{ messageId: 'noLegacyFolder', data: { folder: 'utils' } }]
                }
            ]
        });
    });

    test('should pass on allowed folders', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [
                {
                    code: "export const API_URL = 'https://api.example.com';",
                    filename: '/project/src/shared/config/api.ts'
                },
                {
                    code: 'export const User = {};',
                    filename: '/project/src/entities/user/model/types.ts'
                },
                {
                    code: 'export function formatDate() {}',
                    filename: '/project/src/shared/lib/date/format.ts'
                },
                {
                    code: 'export {};',
                    filename: '/project/src/shared/types/global.ts'
                }
            ],
            invalid: []
        });
    });

    test('should detect forbidden folder at any depth', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [],
            invalid: [
                {
                    code: 'export {};',
                    filename: '/project/src/features/auth/constants/errors.ts',
                    errors: [{ messageId: 'noLegacyFolder', data: { folder: 'constants' } }]
                },
                {
                    code: 'export {};',
                    filename: '/project/src/entities/user/model/utils/helpers.ts',
                    errors: [{ messageId: 'noLegacyFolder', data: { folder: 'utils' } }]
                }
            ]
        });
    });

    test('should support custom folders option', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [
                {
                    code: 'export {};',
                    filename: '/project/src/shared/constants/api.ts',
                    options: [{ folders: ['helpers'] }]
                }
            ],
            invalid: [
                {
                    code: 'export {};',
                    filename: '/project/src/shared/helpers/format.ts',
                    options: [{ folders: ['helpers'] }],
                    errors: [{ messageId: 'noLegacyFolder', data: { folder: 'helpers' } }]
                }
            ]
        });
    });

    test('should not false-positive on similar names', () => {
        tester.run('no-legacy-folders', rule, {
            valid: [
                {
                    code: 'export {};',
                    filename: '/project/src/features/auth/model/constant.ts'
                },
                {
                    code: 'export {};',
                    filename: '/project/src/shared/lib/enum-helpers/index.ts'
                },
                {
                    code: 'export {};',
                    filename: '/project/src/shared/lib/utility/index.ts'
                }
            ],
            invalid: []
        });
    });
});
