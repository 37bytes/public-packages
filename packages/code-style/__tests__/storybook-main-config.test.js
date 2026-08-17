/**
 * @fileoverview Регресс на storybookMainConfig.
 *
 * `.storybook/main.*`/`preview.*` обязаны default-экспортить и импортят
 * `@storybook/*` из devDependencies, но НЕ являются story-файлами. Поэтому им
 * нельзя отдавать полный набор `storybook` (там `story-exports` требует хотя бы
 * одну Story и зафолсил бы). storybookMainConfig гасит только import-правила и
 * включает no-uninstalled-addons (оно про main.*), без story-ориентированных.
 */

import assert from 'node:assert';
import { describe, test } from 'node:test';

import { storybookMainConfig } from '@37bytes/code-style/eslint';
import { Linter } from 'eslint';
import importX from 'eslint-plugin-import-x';

const linter = new Linter();
const config = [
    {
        files: ['**/*.{ts,tsx}'],
        plugins: { 'import-x': importX },
        rules: { 'import-x/no-default-export': 'error', 'import-x/no-anonymous-default-export': 'error' }
    },
    storybookMainConfig
];

const importErrors = (code, filename) =>
    linter.verify(code, config, { filename }).filter((message) => message.ruleId?.startsWith('import-x/'));

describe('storybookMainConfig: shape', () => {
    test('включает no-uninstalled-addons (правило для main.*)', () => {
        assert.equal(storybookMainConfig.rules['storybook/no-uninstalled-addons'], 'error');
    });

    test('НЕ включает story-ориентированные правила (иначе фолс на config-файлах)', () => {
        for (const storyRule of [
            'storybook/story-exports',
            'storybook/csf-component',
            'storybook/prefer-pascal-case'
        ]) {
            assert.ok(!(storyRule in storybookMainConfig.rules), `${storyRule} не должно быть в storybookMainConfig`);
        }
    });

    test('релаксит default-export и extraneous-deps', () => {
        assert.equal(storybookMainConfig.rules['import-x/no-default-export'], 'off');
        assert.equal(storybookMainConfig.rules['import-x/no-anonymous-default-export'], 'off');
        assert.deepEqual(storybookMainConfig.rules['import-x/no-extraneous-dependencies'], [
            'error',
            { devDependencies: true }
        ]);
    });
});

describe('storybookMainConfig: поведение', () => {
    test('.storybook/main.ts с анонимным default-export — чисто', () => {
        assert.deepEqual(importErrors('export default { addons: [] };\n', '.storybook/main.ts'), []);
    });

    test('.storybook/preview.ts с именованным default-export — чисто', () => {
        assert.deepEqual(importErrors('const preview = {};\nexport default preview;\n', '.storybook/preview.ts'), []);
    });

    test('обычный модуль вне .storybook — default-export ловится', () => {
        const errors = importErrors('export default {};\n', 'src/shared/config.ts');
        assert.ok(errors.some((message) => message.ruleId === 'import-x/no-default-export'));
    });
});
