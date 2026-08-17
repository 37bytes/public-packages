/**
 * @fileoverview Регресс на полноту nextjsOverrides.
 *
 * `no-default-export` гасится только для App Router special-файлов, обязанных
 * default-экспортить. Список раньше не включал global-error и metadata-файлы
 * (sitemap/robots/manifest/*-image/icon), из-за чего консюмер рубил правило
 * блоком `app/**` — over-broad, обычный модуль в app/ переставал ловиться.
 *
 * Тест берёт РЕАЛЬНЫЕ globs из shipped-пресета `nextjs` (все конфиги, где
 * no-default-export === 'off') и прогоняет их настоящим файловым матчингом
 * ESLint на espree (без type-aware парсера, иначе project:true даёт fatal).
 */

import assert from 'node:assert';
import { describe, test } from 'node:test';

import { nextjs } from '@37bytes/code-style/eslint';
import { Linter } from 'eslint';
import importX from 'eslint-plugin-import-x';

const RULE = 'import-x/no-default-export';

const offGlobs = nextjs.filter((config) => config.rules?.[RULE] === 'off').flatMap((config) => config.files ?? []);

const linter = new Linter();
const config = [
    { files: ['**/*.{ts,tsx}'], plugins: { 'import-x': importX }, rules: { [RULE]: 'error' } },
    { files: offGlobs, rules: { [RULE]: 'off' } }
];

const isSuppressed = (filename) => {
    const messages = linter.verify('export default function Thing() { return null; }\n', config, { filename });
    // Guard against silently-unlinted files (a no-files base would produce this).
    const notLinted = messages.find((message) => /No matching configuration/.test(message.message));
    assert.ok(!notLinted, `${filename} не залинтился — харнесс сломан`);
    return messages.every((message) => message.ruleId !== RULE);
};

describe('nextjsOverrides: App Router special-файлы', () => {
    test('special-файлы, обязанные default-экспортить — правило погашено', () => {
        for (const filename of [
            'app/page.tsx',
            'app/layout.tsx',
            'app/global-error.tsx',
            'src/app/dashboard/global-error.tsx',
            'app/sitemap.ts',
            'app/robots.ts',
            'app/manifest.ts',
            'app/opengraph-image.tsx',
            'app/blog/icon.tsx',
            'app/apple-icon.ts'
        ]) {
            assert.ok(isSuppressed(filename), `${filename} должен быть в off-списке nextjsOverrides`);
        }
    });

    test('обычные модули в app/ — правило действует (не over-broad)', () => {
        for (const filename of ['app/dashboard/helper.ts', 'app/widgets/UserCard.tsx', 'app/lib/utils.ts']) {
            assert.ok(!isSuppressed(filename), `${filename} НЕ должен глушить no-default-export`);
        }
    });

    test('route handlers — правило действует (named GET/POST, не default)', () => {
        assert.ok(!isSuppressed('app/api/users/route.ts'));
    });
});
