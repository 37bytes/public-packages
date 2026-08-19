/**
 * @fileoverview Тесты на устойчивость загрузки TypeScript-резолвера.
 *
 * Легаси-настройка settings['import-x/resolver'] = { typescript: {...} } задаёт резолвер
 * ИМЕНЕМ, и eslint-plugin-import-x ищет пакет eslint-import-resolver-typescript сначала
 * относительно линтуемого файла, потом относительно самого себя. Пакет объявлен обычной
 * dependency этого пресета, поэтому обе попытки зависят от того, куда пакетный менеджер
 * положил дерево. Когда ни одна не попала, поиск по имени доходит до фолбэка
 * require('typescript'), подтягивает сам компилятор, тот не проходит валидацию интерфейса
 * резолвера, и ESLint сыплет "Resolve error" на каждый импорт в каждом файле.
 *
 * Воспроизвести это в процессе нельзя: import-x резолвит и от своего расположения тоже,
 * а в этом монорепозитории он лежит рядом с резолвером. Поэтому инвариант проверяется
 * структурно: пресет обязан отдавать резолвер ОБЪЕКТОМ через import-x/resolver-next,
 * который плагин берёт как есть, вместо имени, которое он идёт искать по дереву.
 */

import { library } from '#config';

import assert from 'node:assert';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

import { ESLint } from 'eslint';

const TSCONFIG = JSON.stringify({
    compilerOptions: { module: 'ESNext', moduleResolution: 'bundler', strict: true },
    include: ['src']
});

/** Собирает значение ключа settings со всех слоёв пресета. */
const collectSetting = (preset, key) =>
    preset.filter((layer) => layer.settings && key in layer.settings).map((layer) => layer.settings[key]);

let projectRoot;
let originalCwd;

/** Кладёт файл фикстуры внутрь временного проекта. */
const writeFixtureFile = (relativePath, contents) =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- путь склеен из projectRoot (mkdtempSync) и литерала, пользовательского ввода тут нет
    writeFileSync(path.join(projectRoot, relativePath), contents);

before(() => {
    // realpathSync обязателен: на macOS os.tmpdir() отдаёт /var/..., а cwd после chdir
    // становится /private/var/..., и parserOptions.project не находит tsconfig
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- аргумент приходит из mkdtempSync поверх os.tmpdir(), а не из пользовательского ввода
    projectRoot = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'code-style-resolver-')));
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- projectRoot приходит из mkdtempSync, а не из пользовательского ввода
    mkdirSync(path.join(projectRoot, 'src'));
    writeFixtureFile('tsconfig.json', TSCONFIG);
    writeFixtureFile(path.join('src', 'leaf.ts'), 'export const leaf = (): number => 1;\n');
    writeFixtureFile(
        path.join('src', 'main.ts'),
        "import { leaf } from './leaf';\n\nexport const main = (): number => leaf() + 1;\n"
    );

    originalCwd = process.cwd();
    process.chdir(projectRoot);
});

after(() => {
    process.chdir(originalCwd);
    rmSync(projectRoot, { recursive: true, force: true });
});

describe('TypeScript resolver loading', () => {
    test('should hand import-x a resolver object instead of a resolver name — catches a preset whose resolution depends on where the package manager hoisted eslint-import-resolver-typescript', () => {
        const resolversNext = collectSetting(library, 'import-x/resolver-next');

        assert.ok(resolversNext.length > 0, "пресет не задаёт settings['import-x/resolver-next']");

        for (const resolvers of resolversNext) {
            assert.ok(Array.isArray(resolvers), 'import-x/resolver-next должен быть массивом резолверов');
            assert.ok(resolvers.length > 0, 'import-x/resolver-next пустой');

            for (const resolver of resolvers) {
                assert.strictEqual(resolver.interfaceVersion, 3, `резолвер ${resolver.name} не v3`);
                assert.strictEqual(typeof resolver.resolve, 'function', `у резолвера ${resolver.name} нет resolve()`);
            }
        }
    });

    test('should not reference a resolver by name anywhere in the preset — catches a legacy import-x/resolver left behind, which import-x silently prefers to ignore once resolver-next is set', () => {
        const legacyResolvers = collectSetting(library, 'import-x/resolver');

        assert.deepStrictEqual(legacyResolvers, [], "пресет всё ещё задаёт легаси settings['import-x/resolver']");
    });

    // Страховка на сам фикс: резолвер, импортированный напрямую, должен работать
    // с дефолтными опциями, а не только «быть правильной формы»
    test('should resolve relative TypeScript imports in a project with no local node_modules — catches a directly imported resolver that is wired up but misconfigured', async () => {
        const eslint = new ESLint({
            overrideConfigFile: true,
            overrideConfig: library,
            cwd: projectRoot
        });

        const [result] = await eslint.lintFiles([path.join(projectRoot, 'src', 'main.ts')]);
        const resolveErrors = result.messages.filter((message) => message.message.startsWith('Resolve error'));

        assert.deepStrictEqual(
            resolveErrors.map((message) => message.message),
            [],
            'Резолвер не загрузился: правила import-x сообщают Resolve error вместо разбора импортов'
        );
    });
});
