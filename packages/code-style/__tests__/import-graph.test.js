/**
 * @fileoverview E2E тесты для правил import-x, которым нужен граф модулей.
 *
 * no-cycle, named и no-deprecated работают не по AST текущего файла, а по ExportMap:
 * плагин сам открывает импортируемый файл и парсит его. Для .ts/.tsx это возможно
 * только если в settings задан import-x/parsers, иначе ExportMap молча пустой и
 * правила ничего не находят, оставаясь при этом включёнными. Тесты линтуют файлы
 * с диска через shipped-пресет library, то есть проверяют ровно те settings,
 * которые уезжают потребителю.
 */

import { library } from '#config';

import assert from 'node:assert';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

import { ESLint } from 'eslint';

const FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'import-graph-project');
const SRC = path.join(FIXTURE_ROOT, 'src');

// typescriptConfig объявляет parserOptions.project: true, а он резолвит tsconfig от cwd
const originalCwd = process.cwd();
before(() => process.chdir(FIXTURE_ROOT));
after(() => process.chdir(originalCwd));

/**
 * Линтит файл фикстуры с диска shipped-пресетом library.
 *
 * @param {string} relativePath — путь относительно src/
 * @param {import('eslint').Linter.Config[]} [extraConfig] — дополнительные слои поверх пресета
 * @returns {Promise<import('eslint').ESLint.LintMessage[]>}
 */
const lintFixtureFile = async (relativePath, extraConfig = []) => {
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [...library, ...extraConfig],
        cwd: FIXTURE_ROOT
    });

    const results = await eslint.lintFiles([path.join(SRC, relativePath)]);
    return results[0]?.messages || [];
};

/** Проверяет, что среди сообщений есть ошибка от указанного правила. */
const assertHasError = (messages, ruleId) => {
    const match = messages.find((message) => message.ruleId === ruleId);
    assert.ok(
        match,
        `Ожидалась ошибка '${ruleId}', но её нет. Сообщения: ${JSON.stringify(messages.map((message) => message.ruleId))}`
    );
};

/** Проверяет, что среди сообщений нет ошибки от указанного правила. */
const assertNoError = (messages, ruleId) => {
    const match = messages.find((message) => message.ruleId === ruleId);
    assert.ok(!match, `Не ожидалась ошибка '${ruleId}', но она есть: ${JSON.stringify(match)}`);
};

describe('import-x module graph on TypeScript', () => {
    test('should report import-x/no-cycle for a two-file TypeScript cycle — catches an ExportMap that cannot parse .ts and therefore silently finds no cycles', async () => {
        const messages = await lintFixtureFile('alpha.ts');

        assertHasError(messages, 'import-x/no-cycle');
    });

    test('should not report import-x/no-cycle for an acyclic TypeScript import — catches a graph that reports every edge as a cycle', async () => {
        const messages = await lintFixtureFile('acyclicConsumer.ts');

        assertNoError(messages, 'import-x/no-cycle');
    });

    // import-x/named в поставляемом пресете намеренно выключен (TypeScript проверяет это сам),
    // здесь оно включается точечно как прямой зонд на то, что ExportMap читает экспорты из .ts
    test('should report import-x/named for a missing named export from a TypeScript module — catches an ExportMap that resolves the file but reads no exports out of it', async () => {
        const messages = await lintFixtureFile('missingNamedImport.ts', [{ rules: { 'import-x/named': 'error' } }]);

        assertHasError(messages, 'import-x/named');
    });
});
