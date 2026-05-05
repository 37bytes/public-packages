/**
 * @fileoverview Tests for createRestrictedImportsConfig
 */

import assert from 'node:assert';
import { describe, test } from 'node:test';

import { createRestrictedImportsConfig } from '../restricted-imports.js';

describe('createRestrictedImportsConfig', () => {
    test('should return array of 1 config object when called without arguments', () => {
        const result = createRestrictedImportsConfig();

        assert.ok(Array.isArray(result), 'should return an array');
        assert.strictEqual(result.length, 1, 'should contain 1 config object');
    });

    test('should have correct files pattern', () => {
        const [config] = createRestrictedImportsConfig();

        assert.deepStrictEqual(config.files, ['**/*.{ts,tsx}']);
    });

    test('should include default FC restriction in paths', () => {
        const [config] = createRestrictedImportsConfig();
        const rule = config.rules['@typescript-eslint/no-restricted-imports'];

        assert.strictEqual(rule[0], 'error');
        assert.ok(Array.isArray(rule[1].paths), 'paths should be an array');

        const fcRestriction = rule[1].paths.find(
            (package_) => package_.name === 'react' && package_.importNames?.includes('FC')
        );
        assert.ok(fcRestriction, 'should contain FC restriction');
        assert.ok(fcRestriction.message, 'FC restriction should have a message');
    });

    test('should merge custom paths with defaults', () => {
        const customPath = {
            name: 'clsx',
            message: 'Используйте @/shared/lib/classNames'
        };
        const [config] = createRestrictedImportsConfig({ paths: [customPath] });
        const rule = config.rules['@typescript-eslint/no-restricted-imports'];

        assert.strictEqual(rule[1].paths.length, 2, 'should have default + custom paths');
        assert.deepStrictEqual(rule[1].paths[1], customPath);
    });

    test('should support allowTypeImports in custom paths', () => {
        const customPath = {
            name: '@lingui/react',
            importNames: ['useLingui'],
            message: 'Используйте useI18n',
            allowTypeImports: true
        };
        const [config] = createRestrictedImportsConfig({ paths: [customPath] });
        const rule = config.rules['@typescript-eslint/no-restricted-imports'];

        const lingui = rule[1].paths.find((package_) => package_.name === '@lingui/react');
        assert.strictEqual(lingui.allowTypeImports, true);
    });

    test('should include default devDependencies patterns', () => {
        const [config] = createRestrictedImportsConfig();
        const rule = config.rules['import-x/no-extraneous-dependencies'];

        assert.strictEqual(rule[0], 'error');
        assert.ok(rule[1].devDependencies.includes('**/*.test.ts'));
        assert.ok(rule[1].devDependencies.includes('**/*.stories.tsx'));
        assert.ok(rule[1].devDependencies.includes('.storybook/**/*'));
    });

    test('should merge custom devDependencies with defaults', () => {
        const [config] = createRestrictedImportsConfig({ devDependencies: ['**/*.e2e.ts'] });
        const rule = config.rules['import-x/no-extraneous-dependencies'];

        assert.ok(rule[1].devDependencies.includes('**/*.test.ts'), 'should keep defaults');
        assert.ok(rule[1].devDependencies.includes('**/*.e2e.ts'), 'should include custom pattern');
    });

    test('should have both rules in config', () => {
        const [config] = createRestrictedImportsConfig();

        assert.ok(config.rules['@typescript-eslint/no-restricted-imports'], 'should have no-restricted-imports');
        assert.ok(config.rules['import-x/no-extraneous-dependencies'], 'should have no-extraneous-dependencies');
        assert.strictEqual(Object.keys(config.rules).length, 2, 'should have exactly 2 rules');
    });
});
