/**
 * @fileoverview E2E тесты для FSD-архитектуры
 *
 * Проверяют работу createFSDConfig() целиком — включая import-x/no-restricted-paths,
 * import-x/no-internal-modules и кастомные @37bytes правила — с реальным
 * TypeScript резолвером и fixture FSD-проектом.
 */

import assert from 'node:assert';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import tsparser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';

import { createFSDConfig } from '../eslint/fsd.js';

const __dirname = import.meta.dirname;
const FIXTURE_ROOT = path.join(__dirname, 'fixtures', 'fsd-project');
const SRC = path.join(FIXTURE_ROOT, 'src');

// import-x/no-restricted-paths резолвит зоны относительно process.cwd()
const originalCwd = process.cwd();
before(() => process.chdir(FIXTURE_ROOT));
after(() => process.chdir(originalCwd));

/**
 * Линтит код как если бы он находился в файле filePath внутри fixture.
 *
 * @param {string} code — исходный код
 * @param {string} relativePath — путь относительно src/ (например 'entities/user/model/types.ts')
 * @param {object} [fsdOptions] — опции для createFSDConfig()
 * @returns {Promise<import('eslint').ESLint.LintMessage[]>}
 */
const lint = async (code, relativePath, fsdOptions) => {
    const filePath = path.join(SRC, relativePath);
    const fsd = createFSDConfig(fsdOptions);

    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.{js,jsx,ts,tsx}'],
                languageOptions: {
                    parser: tsparser,
                    ecmaVersion: 2022,
                    sourceType: 'module',
                    parserOptions: {
                        project: path.join(FIXTURE_ROOT, 'tsconfig.json'),
                        tsconfigRootDir: FIXTURE_ROOT
                    }
                },
                settings: {
                    'import-x/resolver': {
                        typescript: {
                            project: path.join(FIXTURE_ROOT, 'tsconfig.json'),
                            alwaysTryTypes: true
                        }
                    }
                }
            },
            ...fsd
        ],
        cwd: FIXTURE_ROOT
    });

    const results = await eslint.lintText(code, { filePath });
    return results[0]?.messages || [];
};

/**
 * Проверяет, что среди сообщений есть ошибка от указанного правила.
 */
const assertHasError = (messages, ruleId, context = '') => {
    const match = messages.find((message) => message.ruleId === ruleId);
    assert.ok(
        match,
        `Ожидалась ошибка '${ruleId}'${context ? ` (${context})` : ''}, но её нет. Сообщения: ${JSON.stringify(messages.map((message) => message.ruleId))}`
    );
};

/**
 * Проверяет, что среди сообщений нет ошибки от указанного правила.
 */
const assertNoError = (messages, ruleId, context = '') => {
    const match = messages.find((message) => message.ruleId === ruleId);
    assert.ok(
        !match,
        `Не ожидалась ошибка '${ruleId}'${context ? ` (${context})` : ''}, но она есть: ${match?.message}`
    );
};

// ─── Группа 1: Иерархия слоёв ──────────────────────────────────────────────

describe('FSD e2e: иерархия слоёв (import-x/no-restricted-paths)', () => {
    test('shared не может импортировать из entities', async () => {
        const messages = await lint("import { User } from '@/entities/user';", 'shared/lib/classNames/index.ts');
        assertHasError(messages, 'import-x/no-restricted-paths');
    });

    test('entities не может импортировать из features', async () => {
        const messages = await lint("import { auth } from '@/features/auth';", 'entities/user/model/types.ts');
        assertHasError(messages, 'import-x/no-restricted-paths');
    });

    test('features не может импортировать из pages', async () => {
        const messages = await lint("import { home } from '@/pages/home';", 'features/auth/model/store.ts');
        assertHasError(messages, 'import-x/no-restricted-paths');
    });

    test('widgets не может импортировать из pages', async () => {
        const messages = await lint("import { home } from '@/pages/home';", 'widgets/header/ui/Header.tsx');
        assertHasError(messages, 'import-x/no-restricted-paths');
    });

    test('app может импортировать из любого слоя', async () => {
        const messages = await lint(
            "import { home } from '@/pages/home';\nimport { auth } from '@/features/auth';\nimport { cn } from '@/shared/lib/classNames';",
            'app/index.ts'
        );
        assertNoError(messages, 'import-x/no-restricted-paths');
    });

    test('features может импортировать из shared', async () => {
        const messages = await lint("import { cn } from '@/shared/lib/classNames';", 'features/auth/model/store.ts');
        assertNoError(messages, 'import-x/no-restricted-paths');
    });

    test('entities может импортировать из shared', async () => {
        const messages = await lint("import { Button } from '@/shared/ui';", 'entities/user/model/types.ts');
        assertNoError(messages, 'import-x/no-restricted-paths');
    });
});

// ─── Группа 1b: Cross-imports между слайсами одного слоя ─────────────────────

describe('FSD e2e: cross-imports между слайсами (import-x/no-restricted-paths)', () => {
    test('entities/user не может импортировать entities/session', async () => {
        const messages = await lint("import { Session } from '@/entities/session';", 'entities/user/model/types.ts');
        assertHasError(messages, 'import-x/no-restricted-paths');
    });

    test('features/auth не может импортировать features/search', async () => {
        const messages = await lint("import { search } from '@/features/search';", 'features/auth/model/store.ts');
        assertHasError(messages, 'import-x/no-restricted-paths');
    });
});

// ─── Группа 2: Public API ───────────────────────────────────────────────────

describe('FSD e2e: public API (import-x/no-internal-modules)', () => {
    test('импорт через public API слайса — OK', async () => {
        const messages = await lint("import { User } from '@/entities/user';", 'features/auth/model/store.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('глубокий импорт в слайс — ERROR', async () => {
        const messages = await lint(
            "import { UserType } from '@/entities/user/model/types';",
            'features/auth/model/store.ts'
        );
        assertHasError(messages, 'import-x/no-internal-modules');
    });

    test('внутрислайсовый импорт через абсолютный путь — ERROR', async () => {
        const messages = await lint(
            "import Icon from '@/pages/home/components/icon/Icon';",
            'pages/home/components/Button.tsx'
        );
        assertHasError(messages, 'import-x/no-internal-modules');
    });

    test('импорт shared/lib через public API — OK', async () => {
        const messages = await lint("import { cn } from '@/shared/lib/classNames';", 'features/auth/model/store.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('глубокий импорт в shared/lib — ERROR', async () => {
        const messages = await lint(
            "import { merge } from '@/shared/lib/classNames/utils';",
            'features/auth/model/store.ts'
        );
        assertHasError(messages, 'import-x/no-internal-modules');
    });

    test('глубокий импорт shared/ui/Button — ERROR', async () => {
        const messages = await lint("import { Button } from '@/shared/ui/Button';", 'features/auth/model/store.ts');
        assertHasError(messages, 'import-x/no-internal-modules');
    });

    test('импорт shared/ui через public API — OK', async () => {
        const messages = await lint("import { Button } from '@/shared/ui';", 'features/auth/model/store.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('импорт shared/api через public API — OK', async () => {
        const messages = await lint("import { api } from '@/shared/api/base';", 'features/auth/model/store.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });
});

// ─── Группа 3: Barrel-файлы ─────────────────────────────────────────────────

describe('FSD e2e: barrel-файлы (исключения no-internal-modules)', () => {
    test('index.ts может импортировать внутренности своего модуля', async () => {
        const messages = await lint("import { UserType } from './model/types';", 'entities/user/index.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('server.ts может импортировать внутренности своего модуля', async () => {
        const messages = await lint(
            "import 'server-only';\nimport { store } from './model/store';",
            'features/auth/server.ts'
        );
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('client.ts может импортировать внутренности своего модуля', async () => {
        const messages = await lint(
            "import 'client-only';\nimport { store } from './model/store';",
            'features/auth/client.ts'
        );
        assertNoError(messages, 'import-x/no-internal-modules');
    });
});

// ─── Группа 4: API-сегмент ──────────────────────────────────────────────────

describe('FSD e2e: api-сегмент (исключения no-internal-modules)', () => {
    test('entities/user/api/ может импортировать внутренности своего слайса', async () => {
        const messages = await lint("import { UserType } from '../model/types';", 'entities/user/api/getUser.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('features/auth/api/ может импортировать внутренности своего слайса', async () => {
        const messages = await lint("import { store } from '../model/store';", 'features/auth/api/login.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('widgets/header/api/ НЕ получает api-исключение', async () => {
        const messages = await lint("import { Header } from '../ui/Header';", 'widgets/header/api/getHeader.ts');
        assertHasError(messages, 'import-x/no-internal-modules');
    });
});

// ─── Группа 5: Само-импорт ──────────────────────────────────────────────────

describe('FSD e2e: само-импорт (@37bytes/no-slice-self-import)', () => {
    test('файл в слайсе не может импортировать свой слайс через public API', async () => {
        const messages = await lint("import { User } from '@/entities/user';", 'entities/user/model/types.ts');
        assertHasError(messages, '@37bytes/no-slice-self-import');
    });
});

// ─── Группа 6: server-only / client-only ────────────────────────────────────

describe('FSD e2e: server-only / client-only', () => {
    test('server.ts без import server-only — ERROR', async () => {
        const messages = await lint("import { store } from './model/store';", 'features/auth/server.ts');
        assertHasError(messages, '@37bytes/require-server-only');
    });

    test('client.ts без import client-only — ERROR', async () => {
        const messages = await lint("import { store } from './model/store';", 'features/auth/client.ts');
        assertHasError(messages, '@37bytes/require-client-only');
    });

    test('server.ts с import server-only первой строкой — OK', async () => {
        const messages = await lint(
            "import 'server-only';\nimport { store } from './model/store';",
            'features/auth/server.ts'
        );
        assertNoError(messages, '@37bytes/require-server-only');
    });

    test('client.ts с import client-only первой строкой — OK', async () => {
        const messages = await lint(
            "import 'client-only';\nimport { store } from './model/store';",
            'features/auth/client.ts'
        );
        assertNoError(messages, '@37bytes/require-client-only');
    });

    test('server.ts с import server-only НЕ первой строкой — ERROR', async () => {
        const messages = await lint(
            "import { store } from './model/store';\nimport 'server-only';",
            'features/auth/server.ts'
        );
        assertHasError(messages, '@37bytes/require-server-only');
    });

    test('client.ts с import server-only вместо client-only — ERROR', async () => {
        const messages = await lint("import 'server-only';", 'features/auth/client.ts');
        assertHasError(messages, '@37bytes/require-client-only');
    });
});

// ─── Группа 7: server.ts / client.ts как barrel + require-*-only ────────────

describe('FSD e2e: barrel + require-*-only взаимодействие', () => {
    test('server.ts: barrel-исключение (no-internal-modules off) + require-server-only OK', async () => {
        const messages = await lint(
            "import 'server-only';\nimport { store } from './model/store';",
            'features/auth/server.ts'
        );
        assertNoError(messages, 'import-x/no-internal-modules');
        assertNoError(messages, '@37bytes/require-server-only');
    });

    test('client.ts: barrel-исключение (no-internal-modules off) + require-client-only OK', async () => {
        const messages = await lint(
            "import 'client-only';\nimport { store } from './model/store';",
            'features/auth/client.ts'
        );
        assertNoError(messages, 'import-x/no-internal-modules');
        assertNoError(messages, '@37bytes/require-client-only');
    });

    test('server.ts без server-only: barrel OK но require-server-only ERROR', async () => {
        const messages = await lint("import { store } from './model/store';", 'features/auth/server.ts');
        assertNoError(messages, 'import-x/no-internal-modules');
        assertHasError(messages, '@37bytes/require-server-only');
    });
});

// ─── Группа 8: @x cross-imports ─────────────────────────────────────────────

describe('FSD e2e: @x cross-imports (no-internal-modules)', () => {
    test('@/entities/user/@x разрешён как public API из обычного файла', async () => {
        const messages = await lint(
            "import { userForSession } from '@/entities/user/@x';",
            'features/auth/model/store.ts'
        );
        assertNoError(messages, 'import-x/no-internal-modules');
    });

    test('@/entities/user/@x/session разрешён как public API из обычного файла', async () => {
        const messages = await lint(
            "import { userForSession } from '@/entities/user/@x/session';",
            'features/auth/model/store.ts'
        );
        assertNoError(messages, 'import-x/no-internal-modules');
    });
});

// ─── Группа 9: import-x/order ───────────────────────────────────────────────

describe('FSD e2e: порядок импортов (import-x/order)', () => {
    test('импорт shared перед features — ERROR (неправильный порядок)', async () => {
        const messages = await lint(
            "import { cn } from '@/shared/lib/classNames';\nimport { User } from '@/entities/user';",
            'pages/home/ui/HomePage.tsx'
        );
        assertHasError(messages, 'import-x/order');
    });

    test('импорт features перед entities, entities перед shared — OK', async () => {
        const messages = await lint(
            "import { auth } from '@/features/auth';\n\nimport { User } from '@/entities/user';\n\nimport { cn } from '@/shared/lib/classNames';",
            'pages/home/ui/HomePage.tsx'
        );
        assertNoError(messages, 'import-x/order');
    });
});

// ─── Группа 10: allowPatterns ────────────────────────────────────────────────

describe('FSD e2e: allowPatterns опция createFSDConfig()', () => {
    test('без allowPatterns глубокий импорт @/shared/config/theme — ERROR', async () => {
        const messages = await lint("import { theme } from '@/shared/config/theme';", 'features/auth/model/store.ts');
        assertHasError(messages, 'import-x/no-internal-modules');
    });

    test('с allowPatterns глубокий импорт @/shared/config/* — OK', async () => {
        const messages = await lint("import { theme } from '@/shared/config/theme';", 'features/auth/model/store.ts', {
            allowPatterns: ['@/shared/config/*']
        });
        assertNoError(messages, 'import-x/no-internal-modules');
    });
});
