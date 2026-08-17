import { javascript } from '#rules/javascript';
import { typescript } from '#rules/typescript';

import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { ESLint } from 'eslint';

const BASE_FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'cruise-base-project');
const FSD_FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'fsd-cruise-project');

const loadHygiene = () => import('#tests/fixture-hygiene');

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

        assert.strictEqual(identifierLengthConfig.rules['id-length'], javascript['id-length']);
        assert.strictEqual(
            typeScriptNamingConfig.rules['@typescript-eslint/naming-convention'],
            typescript['@typescript-eslint/naming-convention']
        );
        assert.strictEqual(typeScriptNamingConfig.rules['@37bytes/boolean-naming'], 'error');
        assert.strictEqual(typeScriptNamingConfig.rules['@37bytes/enum-pattern'], 'error');
    });
    test('should enforce JavaScript recommended rules when JavaScript probe text is linted: catches omitted @eslint/js recommended config', async () => {
        const { createFixtureHygieneConfig } = await loadHygiene();
        const eslint = new ESLint({
            cwd: BASE_FIXTURE_ROOT,
            overrideConfigFile: true,
            overrideConfig: createFixtureHygieneConfig(BASE_FIXTURE_ROOT)
        });
        const [result] = await eslint.lintText('unresolvedIdentifier;', {
            filePath: path.join(BASE_FIXTURE_ROOT, 'src', 'recommended-probe.js')
        });

        assert.ok(result.messages.some((message) => message.ruleId === 'no-undef'));
    });
    test('should enforce type-checked recommended rules when TypeScript probe text is linted: catches omitted @typescript-eslint type-aware config', async () => {
        const { createFixtureHygieneConfig } = await loadHygiene();
        const eslint = new ESLint({
            cwd: BASE_FIXTURE_ROOT,
            overrideConfigFile: true,
            overrideConfig: createFixtureHygieneConfig(BASE_FIXTURE_ROOT)
        });
        const [result] = await eslint.lintText('Promise.resolve(1);', {
            filePath: path.join(BASE_FIXTURE_ROOT, 'src', 'first.ts')
        });

        assert.ok(result.messages.some((message) => message.ruleId === '@typescript-eslint/no-floating-promises'));
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

describe('dependency-cruiser fixture hygiene: FSD fixture', () => {
    test('should lint every discovered source file when the FSD fixture is checked: catches files silently omitted from ESLint', async () => {
        const { lintFixtureProject } = await loadHygiene();
        const result = await lintFixtureProject(FSD_FIXTURE_ROOT);

        assert.ok(Array.isArray(result.discoveredFiles));
        assert.ok(Array.isArray(result.lintedFiles));
        assert.ok(result.discoveredFiles.length > 0);
        assert.deepStrictEqual(result.lintedFiles, result.discoveredFiles);
    });
    test('should report zero ESLint diagnostics when the FSD fixture is checked: catches accidental JavaScript or TypeScript lint defects', async () => {
        const { lintFixtureProject } = await loadHygiene();
        const result = await lintFixtureProject(FSD_FIXTURE_ROOT);

        assert.deepStrictEqual(result.diagnostics, []);
    });
    test('should include every discovered source file when the FSD TypeScript program is built: catches files silently omitted by tsconfig', async () => {
        const { collectFixtureSourceFiles, inspectTypeScriptFixture } = await loadHygiene();
        const discoveredFiles = await collectFixtureSourceFiles(FSD_FIXTURE_ROOT);
        const result = inspectTypeScriptFixture(FSD_FIXTURE_ROOT);

        assert.deepStrictEqual(result.rootFiles, discoveredFiles);
    });
    test('should report zero TypeScript diagnostics when the FSD fixture is checked: catches missing modules, missing exports, and deprecated options', async () => {
        const { inspectTypeScriptFixture } = await loadHygiene();
        const result = inspectTypeScriptFixture(FSD_FIXTURE_ROOT);

        assert.deepStrictEqual(result.diagnostics, []);
    });
});
