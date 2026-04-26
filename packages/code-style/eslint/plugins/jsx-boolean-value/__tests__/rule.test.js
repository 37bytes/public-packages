/**
 * @fileoverview Tests for jsx-boolean-value rule
 */

import { test } from 'node:test';

import { RuleTester } from 'eslint';

import { rule } from '../rule.js';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true
            }
        }
    }
});

test('jsx-boolean-value: valid code', () => {
    tester.run('jsx-boolean-value', rule, {
        valid: [
            // Shorthand (the desired form)
            '<Input disabled />',
            '<Input disabled readOnly />',
            // Explicit false is meaningful
            '<Input disabled={false} />',
            // Non-literal values
            '<Input disabled={isDisabled} />',
            '<Input disabled={!isEnabled} />',
            '<Input value={42} />',
            '<Input label="hello" />',
            // No attributes at all
            '<Input />'
        ],
        invalid: []
    });
});

test('jsx-boolean-value: invalid code', () => {
    tester.run('jsx-boolean-value', rule, {
        valid: [],
        invalid: [
            {
                code: '<Input disabled={true} />',
                output: '<Input disabled />',
                errors: [{ messageId: 'redundantTrue' }]
            },
            {
                code: '<Input disabled={true} readOnly />',
                output: '<Input disabled readOnly />',
                errors: [{ messageId: 'redundantTrue' }]
            },
            {
                code: '<Input readOnly disabled={true} />',
                output: '<Input readOnly disabled />',
                errors: [{ messageId: 'redundantTrue' }]
            },
            {
                code: '<Input data-testid={true} />',
                output: '<Input data-testid />',
                errors: [{ messageId: 'redundantTrue' }]
            },
            {
                code: '<Input disabled={true} readOnly={true} />',
                output: '<Input disabled readOnly />',
                errors: [{ messageId: 'redundantTrue' }, { messageId: 'redundantTrue' }]
            }
        ]
    });
});
