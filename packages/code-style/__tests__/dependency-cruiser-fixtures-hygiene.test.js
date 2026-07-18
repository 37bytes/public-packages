import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { javascript } from '../eslint/rules/javascript.js';
import { typescript } from '../eslint/rules/typescript.js';

const BASE_FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'cruise-base-project');

const loadHygiene = () => import('./fixture-hygiene.js');

describe('dependency-cruiser fixture hygiene: reusable config', () => {
    test('should reuse the complete package naming policy when TypeScript files are linted: catches a silently weakened fixture preset', async () => {
        const { createFixtureHygieneConfig } = await loadHygiene();
        const config = createFixtureHygieneConfig(BASE_FIXTURE_ROOT);
        const identifierLengthConfig = config.find(
            (entry) => entry.name === '@37bytes/fixture-hygiene/identifier-length'
        );
        const typeScriptNamingConfig = config.find(
            (entry) => entry.name === '@37bytes/fixture-hygiene/typescript-naming'
        );

        assert.deepStrictEqual(identifierLengthConfig.rules['id-length'], javascript['id-length']);
        assert.deepStrictEqual(
            typeScriptNamingConfig.rules['@typescript-eslint/naming-convention'],
            typescript['@typescript-eslint/naming-convention']
        );
        assert.strictEqual(typeScriptNamingConfig.rules['@37bytes/boolean-naming'], 'error');
        assert.strictEqual(typeScriptNamingConfig.rules['@37bytes/enum-pattern'], 'error');
    });
});

describe('dependency-cruiser fixture hygiene: base fixture', () => {
    test('should lint every discovered source file when the base fixture is checked: catches files silently omitted from ESLint', async () => {
        const { lintFixtureProject } = await loadHygiene();
        const result = await lintFixtureProject(BASE_FIXTURE_ROOT);

        assert.ok(Array.isArray(result.discoveredFiles));
        assert.ok(Array.isArray(result.lintedFiles));
        assert.ok(result.discoveredFiles.length > 0);
        assert.deepStrictEqual(result.lintedFiles, result.discoveredFiles);
    });
    test('should report zero ESLint diagnostics when the base fixture is checked: catches accidental JavaScript or TypeScript lint defects', async () => {
        const { lintFixtureProject } = await loadHygiene();
        const result = await lintFixtureProject(BASE_FIXTURE_ROOT);

        assert.deepStrictEqual(result.diagnostics, []);
    });
    test('should include every discovered source file when the base TypeScript program is built: catches files silently omitted by tsconfig', async () => {
        const { collectFixtureSourceFiles, inspectTypeScriptFixture } = await loadHygiene();
        const discoveredFiles = await collectFixtureSourceFiles(BASE_FIXTURE_ROOT);
        const result = inspectTypeScriptFixture(BASE_FIXTURE_ROOT);

        assert.deepStrictEqual(result.rootFiles, discoveredFiles);
    });
    test('should report only the intentional unresolved import when the base TypeScript program is checked: catches accidental TypeScript defects or loss of the unresolved edge', async () => {
        const { inspectTypeScriptFixture } = await loadHygiene();
        const result = inspectTypeScriptFixture(BASE_FIXTURE_ROOT);

        assert.deepStrictEqual(result.diagnostics, [
            {
                code: 2882,
                filePath: 'src/unresolvable.ts',
                line: 1,
                column: 8,
                message: "Cannot find module or type declarations for side-effect import of './missing'."
            }
        ]);
    });
});
