/**
 * @fileoverview Что в пресете spa ловит только @typescript-eslint/no-misused-promises,
 * а что дублируют другие правила, и границы ослабления checksVoidReturn.attributes в tsx.
 *
 * Каждая фикстура линтуется целиком полным пресетом, и проверяется точный набор
 * сработавших правил: "только no-misused-promises" значит, что без него конструкция
 * проходит линт молча.
 */

import { spa } from '#config';
import { executePackageBinary } from '#tests/package-binary';

import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { ESLint } from 'eslint';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..');
const FIXTURE_DIRECTORY = path.join(import.meta.dirname, 'fixtures', 'misused-promises');
const RULE = '@typescript-eslint/no-misused-promises';

const lintFixture = async (filename) => {
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            ...spa,
            {
                files: ['**/*.ts', '**/*.tsx'],
                languageOptions: {
                    parserOptions: {
                        disallowAutomaticSingleRunInference: true,
                        project: path.join(FIXTURE_DIRECTORY, 'tsconfig.json'),
                        tsconfigRootDir: FIXTURE_DIRECTORY
                    }
                }
            }
        ],
        cwd: FIXTURE_DIRECTORY
    });
    const [result] = await eslint.lintFiles([path.join(FIXTURE_DIRECTORY, filename)]);
    return result.messages;
};

const reportedRules = (messages) => messages.map((message) => `${message.line}:${message.ruleId}`);

// oxlint exits non-zero when it reports errors; the JSON report is still on stdout.
const lintFixtureWithOxlint = async (filename) => {
    let stdout;
    try {
        ({ stdout } = await executePackageBinary(
            'oxlint',
            'oxlint',
            ['--type-aware', '--format', 'json', path.join(FIXTURE_DIRECTORY, filename)],
            { cwd: PACKAGE_ROOT }
        ));
    } catch (executionError) {
        if (!executionError.stdout) {
            throw executionError;
        }
        stdout = executionError.stdout;
    }
    return JSON.parse(stdout).diagnostics.map((diagnostic) => `${diagnostic.labels[0].span.line}:${diagnostic.code}`);
};

describe('no-misused-promises: what only this rule catches in spa', () => {
    test('should report only no-misused-promises when an async method implements a void interface method', async () => {
        const messages = await lintFixture('inherited-method.ts');

        assert.deepStrictEqual(reportedRules(messages), [`6:${RULE}`]);
    });

    test('should report only no-misused-promises when an async function is assigned to a void-typed variable', async () => {
        const messages = await lintFixture('void-variable.ts');

        assert.deepStrictEqual(reportedRules(messages), [`1:${RULE}`]);
    });

    test('should report only no-misused-promises when an async listener is passed to addEventListener', async () => {
        const messages = await lintFixture('void-argument.ts');

        assert.deepStrictEqual(reportedRules(messages), [`2:${RULE}`]);
    });
});

describe('no-misused-promises: overlap with other spa rules', () => {
    test('should report the rule alongside no-misused-spread when a promise is spread into an object literal', async () => {
        const messages = await lintFixture('promise-spread.ts');

        assert.deepStrictEqual(reportedRules(messages).toSorted(), [
            `2:${RULE}`,
            '2:@typescript-eslint/no-misused-spread'
        ]);
    });

    test('should report the rule alongside unicorn/no-for-each when forEach receives an async callback', async () => {
        const messages = await lintFixture('for-each.ts');

        assert.deepStrictEqual(reportedRules(messages).toSorted(), [`2:${RULE}`, '2:unicorn/no-for-each']);
    });

    test('should report the rule alongside no-unnecessary-condition when a promise is an if condition', async () => {
        const messages = await lintFixture('condition.ts');

        assert.deepStrictEqual(reportedRules(messages).toSorted(), [
            `2:${RULE}`,
            '2:@typescript-eslint/no-unnecessary-condition'
        ]);
    });
});

describe('no-misused-promises: tsx relaxation of checksVoidReturn.attributes', () => {
    test('should report nothing when an async function is passed to a void JSX attribute in tsx', async () => {
        const messages = await lintFixture('void-attribute.tsx');

        assert.deepStrictEqual(reportedRules(messages), []);
    });

    test('should report no-misused-promises when an async listener is passed to addEventListener in tsx', async () => {
        const messages = await lintFixture('void-argument-in-tsx.tsx');

        assert.deepStrictEqual(reportedRules(messages), [`2:${RULE}`]);
    });

    test('should lint a jsx file without a fatal error', async () => {
        const messages = await lintFixture('plain-component.jsx');

        assert.deepStrictEqual(
            messages.map((message) => message.message),
            []
        );
    });
});

describe('no-misused-promises: oxlint mirror of the tsx relaxation', () => {
    test('should report nothing in oxlint when an async function is passed to a void JSX attribute in tsx', async () => {
        const diagnostics = await lintFixtureWithOxlint('void-attribute.tsx');

        assert.deepStrictEqual(diagnostics, []);
    });

    test('should report no-misused-promises in oxlint when an async listener is passed to addEventListener in tsx', async () => {
        const diagnostics = await lintFixtureWithOxlint('void-argument-in-tsx.tsx');

        assert.deepStrictEqual(diagnostics, ['2:typescript(no-misused-promises)']);
    });
});
