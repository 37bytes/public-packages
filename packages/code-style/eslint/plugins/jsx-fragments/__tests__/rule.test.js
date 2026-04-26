/**
 * @fileoverview Tests for jsx-fragments rule
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

test('jsx-fragments: valid code', () => {
    tester.run('jsx-fragments', rule, {
        valid: [
            // Already shorthand
            '<><Foo /></>',
            '<>text</>',
            '<></>',
            // Long form with key — shorthand cannot carry attributes
            '<React.Fragment key={1}><Foo /></React.Fragment>',
            '<Fragment key="a"><Foo /></Fragment>',
            // Regular components
            '<Wrapper><Foo /></Wrapper>',
            // Self-closing
            '<Foo />'
        ],
        invalid: []
    });
});

test('jsx-fragments: invalid code', () => {
    tester.run('jsx-fragments', rule, {
        valid: [],
        invalid: [
            {
                code: '<React.Fragment><Foo /></React.Fragment>',
                output: '<><Foo /></>',
                errors: [{ messageId: 'preferShorthand' }]
            },
            {
                code: '<Fragment><Foo /></Fragment>',
                output: '<><Foo /></>',
                errors: [{ messageId: 'preferShorthand' }]
            },
            {
                code: '<React.Fragment><Foo /><Bar /></React.Fragment>',
                output: '<><Foo /><Bar /></>',
                errors: [{ messageId: 'preferShorthand' }]
            },
            {
                code: '<React.Fragment>text</React.Fragment>',
                output: '<>text</>',
                errors: [{ messageId: 'preferShorthand' }]
            }
        ]
    });
});
