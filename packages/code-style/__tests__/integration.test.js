/**
 * @fileoverview Integration tests for @37bytes/configs
 *
 * Tests that the configuration can be loaded and applied correctly.
 */

import assert from 'node:assert';
import { describe, test } from 'node:test';

describe('@37bytes/configs integration', () => {
    describe('ESLint exports', () => {
        test('should export rules', async () => {
            const { rules } = await import('../eslint/index.js');
            assert.ok(rules.javascript, 'javascript rules should be exported');
            assert.ok(rules.typescript, 'typescript rules should be exported');
            assert.ok(rules.browser, 'browser rules should be exported');
            assert.ok(rules.react, 'react rules should be exported');
            assert.ok(rules.reactCompiler, 'reactCompiler rules should be exported');
            assert.ok(rules.imports, 'imports rules should be exported');
            assert.ok(rules.testing, 'testing rules should be exported');
            assert.ok(rules.testingReact, 'testingReact rules should be exported');
        });

        test('should export plugins', async () => {
            const { plugins, RULE_NO_STORAGE, RULE_NO_ARROW_PROPS, RULE_BOOLEAN_NAMING } =
                await import('../eslint/index.js');
            assert.ok(plugins, 'plugins should be exported');
            assert.ok(plugins.rules, 'plugins.rules should exist');
            assert.ok(plugins.rules[RULE_NO_STORAGE], 'no-browser-storage rule should exist');
            assert.ok(plugins.rules[RULE_NO_ARROW_PROPS], 'no-arrow-props rule should exist');
            assert.ok(plugins.rules[RULE_BOOLEAN_NAMING], 'boolean-naming rule should exist');
        });

        test('should export configurations', async () => {
            const {
                spa,
                typescriptConfig,
                reactConfig,
                testingConfig,
                nodejsRuntime,
                nodejsTool,
                nodejsConfig,
                nextjsServerConfig
            } = await import('../eslint/index.js');
            assert.ok(Array.isArray(spa), 'spa should be an array');
            assert.ok(typescriptConfig, 'typescriptConfig should be exported');
            assert.ok(reactConfig, 'reactConfig should be exported');
            assert.ok(testingConfig, 'testingConfig should be exported');
            assert.ok(Array.isArray(nodejsRuntime), 'nodejsRuntime should be an array');
            assert.ok(Array.isArray(nodejsTool), 'nodejsTool should be an array');
            assert.ok(nodejsConfig && nodejsConfig.rules, 'nodejsConfig should be a config object with rules');
            assert.ok(nextjsServerConfig && nextjsServerConfig.files, 'nextjsServerConfig should have files glob');
        });
    });

    describe('Prettier exports', () => {
        test('should export config', async () => {
            const { config } = await import('../prettier/index.js');
            assert.ok(config, 'config should be exported');
            assert.strictEqual(config.printWidth, 120);
            assert.strictEqual(config.tabWidth, 4);
            assert.strictEqual(config.singleQuote, true);
            assert.strictEqual(config.endOfLine, 'lf');
        });

        test('should export default config', async () => {
            const prettierConfig = await import('../prettier/index.js');
            assert.ok(prettierConfig.default, 'default export should exist');
            assert.strictEqual(prettierConfig.default.printWidth, 120);
        });
    });

    describe('Individual rule exports', () => {
        test('javascript rules should be valid', async () => {
            const { javascript } = await import('../eslint/rules/javascript.js');
            assert.ok(javascript.curly, 'curly rule should exist');
            assert.ok(javascript['no-console'], 'no-console rule should exist');
            assert.ok(javascript['no-var'], 'no-var rule should exist');
        });

        test('typescript rules should disable conflicting JS rules', async () => {
            const { typescript } = await import('../eslint/rules/typescript.js');
            assert.strictEqual(typescript['no-unused-vars'], 'off');
            assert.strictEqual(typescript['no-undef'], 'off');
            assert.ok(typescript['@typescript-eslint/no-unused-vars']);
        });

        test('react rules should include hooks rules', async () => {
            const { react } = await import('../eslint/rules/react.js');
            assert.ok(react['react-hooks/rules-of-hooks']);
            assert.ok(react['react-hooks/exhaustive-deps']);
        });
    });

    describe('Plugin structure', () => {
        test('no-storage plugin should have correct structure', async () => {
            const plugin = await import('../eslint/plugins/no-storage/index.js');
            assert.ok(plugin.default.rules['no-browser-storage']);
            assert.strictEqual(plugin.default.rules['no-browser-storage'].meta.type, 'problem');
        });

        test('no-arrow-props plugin should have correct structure', async () => {
            const plugin = await import('../eslint/plugins/no-arrow-props/index.js');
            assert.ok(plugin.default.rules['no-arrow-props']);
            assert.strictEqual(plugin.default.rules['no-arrow-props'].meta.type, 'suggestion');
        });

        test('boolean-naming plugin should have correct structure', async () => {
            const plugin = await import('../eslint/plugins/boolean-naming/index.js');
            assert.ok(plugin.default.rules['boolean-naming']);
            assert.strictEqual(plugin.default.rules['boolean-naming'].meta.docs.requiresTypeChecking, true);
        });
    });
});
