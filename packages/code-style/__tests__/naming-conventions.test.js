/**
 * @fileoverview Tests for naming-conventions fixtures
 *
 * Good fixtures should have zero violations.
 * Bad fixtures should have at least one violation each.
 */

import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { ESLint } from 'eslint';

import { recommended } from '../eslint/config.js';

const __dirname = import.meta.dirname;
const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'naming-conventions');
const FIXTURES_PARENT = path.join(__dirname, 'fixtures');

const createESLint = () =>
    new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            ...recommended,
            {
                files: ['**/*.ts', '**/*.tsx', '**/naming-conventions/**'],
                rules: {
                    'import-x/no-extraneous-dependencies': 'off',
                    '@typescript-eslint/no-unsafe-argument': 'off',
                    '@typescript-eslint/no-unsafe-assignment': 'off',
                    '@typescript-eslint/no-unsafe-call': 'off',
                    '@typescript-eslint/no-unsafe-member-access': 'off',
                    '@typescript-eslint/no-unsafe-return': 'off'
                }
            }
        ],
        cwd: FIXTURES_PARENT
    });

const lintFixture = async (relativePath) => {
    const eslint = createESLint();
    const filePath = path.join(FIXTURE_DIR, relativePath);
    const results = await eslint.lintFiles([filePath]);
    return results[0]?.messages || [];
};

describe('naming-conventions: good fixtures', () => {
    const goodFiles = ['good/hook.ts', 'good/component.tsx', 'good/api.ts', 'good/utils.ts'];

    for (const file of goodFiles) {
        test(`${file} should have zero violations`, async () => {
            const messages = await lintFixture(file);
            const errors = messages.filter((message) => message.severity === 2);
            const warnings = messages.filter((message) => message.severity === 1);

            if (messages.length > 0) {
                const summary = messages.map(
                    (message) =>
                        `  ${message.line}:${message.column} ${message.ruleId} (${message.severity === 2 ? 'error' : 'warn'})`
                );
                assert.fail(`Expected zero violations in ${file}, got ${messages.length}:\n${summary.join('\n')}`);
            }

            assert.strictEqual(errors.length, 0, `${file} should have zero errors`);
            assert.strictEqual(warnings.length, 0, `${file} should have zero warnings`);
        });
    }
});

describe('naming-conventions: bad fixtures', () => {
    const badFiles = [
        { file: 'bad/javascript/arrow-with-braces.ts', rule: 'arrow-body-style' },
        { file: 'bad/javascript/if-without-braces.ts', rule: 'curly' },
        { file: 'bad/javascript/nested-ternary.ts', rule: 'no-nested-ternary' },
        { file: 'bad/javascript/destructuring-without-rename.ts', rule: '@typescript-eslint/naming-convention' },
        { file: 'bad/javascript/boolean-without-prefix.ts', rule: '@37bytes/boolean-naming' },
        { file: 'bad/typescript/interface-i-prefix.ts', rule: '@typescript-eslint/naming-convention' },
        { file: 'bad/typescript/type-t-prefix.ts', rule: '@typescript-eslint/naming-convention' },
        { file: 'bad/typescript/generic-t-prefix.ts', rule: '@typescript-eslint/naming-convention' },
        { file: 'bad/react/function-declaration.tsx', rule: 'react/function-component-definition' },
        { file: 'bad/react/is-disabled-prop.tsx', rule: 'react/boolean-prop-naming' },
        { file: 'bad/react/and-without-boolean.tsx', rule: 'react/jsx-no-leaked-render' }
    ];

    for (const { file, rule } of badFiles) {
        test(`${file} should violate ${rule}`, async () => {
            const messages = await lintFixture(file);
            const hasExpectedRule = messages.some((message) => message.ruleId === rule);
            assert.ok(
                hasExpectedRule,
                `Expected violation by ${rule} in ${file}, got: ${messages.map((message) => message.ruleId).join(', ') || 'none'}`
            );
        });
    }
});
