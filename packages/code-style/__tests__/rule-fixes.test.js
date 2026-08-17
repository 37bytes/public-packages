/**
 * @fileoverview Регресс-тесты на два дефекта code-style@0.0.3-dev.0:
 *
 * 3.1 Phantom rule: testingLibraryRules ссылалась на
 *     testing-library/no-wait-for-empty-callback, выпиленное в
 *     eslint-plugin-testing-library@7. Ссылка на несуществующее правило роняет
 *     линт консюмера. Guard проверяет, что КАЖДОЕ testing-library/* правило
 *     реально существует в установленном плагине.
 *
 * 3.2 Конфликт require-server-only vs perfectionist: sort-imports загонял
 *     import 'server-only' в группу side-effect (позиция 5), а
 *     @37bytes/require-server-only требует его первой строкой. Два автофикса с
 *     противоположным направлением. Фикс: группа server-boundary первой.
 *     Поведенческий тест линтует реальный shipped-конфиг.
 */

import assert from 'node:assert';
import { describe, test } from 'node:test';

import { perfectionistReact, rules, testingLibraryRules, withServerBoundaryFirst } from '@37bytes/code-style/eslint';
import { Linter } from 'eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import testingLibrary from 'eslint-plugin-testing-library';

const SORT_IMPORTS = 'perfectionist/sort-imports';

const lint = (code, sortImportsConfig, filename, files) => {
    const linter = new Linter();
    const messages = linter.verify(
        code,
        [{ files, plugins: { perfectionist }, rules: { [SORT_IMPORTS]: sortImportsConfig } }],
        {
            filename
        }
    );
    return messages.filter((message) => message.ruleId === SORT_IMPORTS);
};

describe('3.1 phantom testing-library rule', () => {
    const availableRules = new Set(Object.keys(testingLibrary.rules));

    test('каждое testing-library/* правило существует в установленном плагине', () => {
        for (const key of Object.keys(testingLibraryRules)) {
            assert.ok(key.startsWith('testing-library/'), `неожиданный неймспейс: ${key}`);
            const ruleName = key.slice('testing-library/'.length);
            assert.ok(
                availableRules.has(ruleName),
                `phantom rule: testing-library/${ruleName} нет в eslint-plugin-testing-library@${testingLibrary.meta?.version ?? '7'}`
            );
        }
    });

    test('конкретно no-wait-for-empty-callback не воскрешено', () => {
        assert.ok(!('testing-library/no-wait-for-empty-callback' in testingLibraryRules));
        assert.ok(
            !availableRules.has('no-wait-for-empty-callback'),
            'если плагин вернул правило — можно снова включать'
        );
    });
});

describe('3.2 server-boundary в perfectionist sort-imports', () => {
    const baseSortImports = rules.perfectionist[SORT_IMPORTS];
    const reactSortImports = perfectionistReact[SORT_IMPORTS];

    test('base: server-boundary первой группой, маркер в customGroups', () => {
        const options = baseSortImports[1];
        assert.equal(options.groups[0], 'server-boundary');
        assert.ok(options.customGroups.some((group) => group.groupName === 'server-boundary'));
    });

    test('react: server-boundary первой группой, react/next сохранены', () => {
        const options = reactSortImports[1];
        assert.equal(options.groups[0], 'server-boundary');
        assert.ok(options.groups.includes('react'));
        assert.ok(options.groups.includes('next'));
        assert.ok(options.customGroups.some((group) => group.groupName === 'react'));
    });

    test('поведение base: import server-only первым — чисто', () => {
        const code = "import 'server-only';\n\nimport { z } from 'zod';\n\nexport const schema = z.string();\n";
        assert.deepEqual(lint(code, baseSortImports, 'src/features/x/server.ts', ['**/*.ts']), []);
    });

    test('поведение base: import server-only НЕ первым — ошибка (perfectionist требует его первым)', () => {
        const code = "import { z } from 'zod';\n\nimport 'server-only';\n\nexport const schema = z.string();\n";
        const errors = lint(code, baseSortImports, 'src/features/x/server.ts', ['**/*.ts']);
        assert.equal(errors.length, 1);
        assert.match(errors[0].message, /server-only/);
    });

    test('поведение react: import client-only первым в tsx — чисто', () => {
        const code = "import 'client-only';\n\nimport { useState } from 'react';\n";
        assert.deepEqual(lint(code, reactSortImports, 'src/widgets/x/Component.tsx', ['**/*.tsx']), []);
    });
});

describe('withServerBoundaryFirst (экспортируемый инвариант)', () => {
    test('поднимает server-boundary первой группой, сохраняя остальные', () => {
        const result = withServerBoundaryFirst({
            groups: ['external', 'internal'],
            customGroups: [{ groupName: 'react' }]
        });
        assert.equal(result.groups[0], 'server-boundary');
        assert.deepEqual(result.groups, ['server-boundary', 'external', 'internal']);
        assert.ok(result.customGroups.some((group) => group.groupName === 'react'));
        assert.ok(result.customGroups.some((group) => group.groupName === 'server-boundary'));
    });

    test('идемпотентна: повторное применение не дублирует', () => {
        const once = withServerBoundaryFirst({ groups: ['external'], customGroups: [{ groupName: 'x' }] });
        const twice = withServerBoundaryFirst(once);
        assert.deepEqual(twice, once);
        assert.equal(once.groups.filter((group) => group === 'server-boundary').length, 1);
        assert.equal(once.customGroups.filter((group) => group.groupName === 'server-boundary').length, 1);
    });

    test('работает без customGroups во входе', () => {
        const result = withServerBoundaryFirst({ groups: ['external'] });
        assert.equal(result.customGroups.length, 1);
        assert.equal(result.customGroups[0].groupName, 'server-boundary');
    });
});
