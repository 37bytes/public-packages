import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { ESLint } from 'eslint';

describe('package import hygiene', () => {
    test('should reject relative static module specifiers when package code bypasses native aliases — catches reintroduced .js and /index.js imports', async () => {
        const eslint = new ESLint({ cwd: path.resolve(import.meta.dirname, '..') });
        const sources = ["import './eslint/index.js';", "export * from './eslint/index.js';"];

        for (const source of sources) {
            const [result] = await eslint.lintText(source, {
                filePath: path.resolve(import.meta.dirname, '..', 'import-hygiene-probe.js')
            });
            assert.ok(
                result.messages.some((message) => message.ruleId === 'no-restricted-imports'),
                `expected no-restricted-imports for: ${source}`
            );
        }
    });

    test('should reject relative dynamic imports when package code bypasses native aliases — catches dynamic imports escaping the static-import guard', async () => {
        const eslint = new ESLint({ cwd: path.resolve(import.meta.dirname, '..') });
        const sources = [
            "void import('./eslint/index.js');",
            "void import('.');",
            "void import('..');",
            'void import(`./eslint/index.js`);'
        ];

        for (const source of sources) {
            const [result] = await eslint.lintText(source, {
                filePath: path.resolve(import.meta.dirname, '..', 'import-hygiene-probe.js')
            });

            assert.ok(
                result.messages.some((message) => message.ruleId === 'no-restricted-syntax'),
                `expected no-restricted-syntax for: ${source}`
            );
        }
    });

    test('should allow native aliases and package self-references when package code uses public routing — catches an overbroad import restriction', async () => {
        const [internalModule, pluginRuleModule, publicModule] = await Promise.all([
            import('#eslint/browser-features'),
            import('#eslint/plugins/no-storage/rule'),
            import('@37bytes/code-style/eslint')
        ]);

        assert.strictEqual(typeof internalModule.browserFeaturesConfig, 'function');
        assert.strictEqual(typeof pluginRuleModule.rule, 'object');
        assert.strictEqual(typeof publicModule.nodejsRuntime, 'object');
    });
});
