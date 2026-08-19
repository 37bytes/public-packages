/**
 * @fileoverview Main ESLint configuration
 * @author 37bytes
 *
 * Application-type configs: spa, nextjs, nodejsRuntime (strict),
 * nodejsTool (lax). Opt-in overrides: nodejsConfig (для bootstrap-файлов),
 * nextjsServerConfig (для Next.js server-side), testingConfig,
 * testingReactConfig, storybookConfig, reactCompilerConfig,
 * createFSDConfig, createRestrictedImportsConfig.
 * Perfectionist namespace: perfectionist.spa, perfectionist.nextjs,
 * perfectionist.nodejsRuntime, perfectionist.nodejsTool.
 */

import { plugins } from '#plugins';
import { browser } from '#rules/browser';
import { imports } from '#rules/imports';
import { javascript } from '#rules/javascript';
import { nextjs as nextjsRules } from '#rules/nextjs';
import { node, nodeCjs } from '#rules/node';
import { perfectionistReact, perfectionist as perfectionistRules } from '#rules/perfectionist';
import { quality } from '#rules/quality';
import { react } from '#rules/react';
import { reactCompiler } from '#rules/react-compiler';
import { reactStylistic } from '#rules/react-stylistic';
import { regexp } from '#rules/regexp';
import { storybook } from '#rules/storybook';
import { testingLibraryRules, testOverrides, vitestRules } from '#rules/testing';
import { typescript } from '#rules/typescript';

import { fileURLToPath } from 'node:url';

import reactPlugin from '@eslint-react/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vitestPlugin from '@vitest/eslint-plugin';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';
import nodePlugin from 'eslint-plugin-n';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import promisePlugin from 'eslint-plugin-promise';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import regexpPlugin from 'eslint-plugin-regexp';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import storybookPlugin from 'eslint-plugin-storybook';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';

// Абсолютный путь, а не имя пакета: имя import-x прогоняет через moduleRequire, который
// резолвит сначала от расположения eslint и от require.main, и только третьей попыткой от
// линтуемого файла. В pnpm-монорепозитории первые две уводят в общий хойстнутый стор и
// могут отдать копию парсера на несколько мажоров старше объявленной.
const TS_PARSER_PATH = fileURLToPath(import.meta.resolve('@typescript-eslint/parser'));

// ── Test file patterns ───────────────────────────────────────────────────────

const TEST_FILES = [
    '**/*.test.js',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.js',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/__tests__/**/*'
];

const TEST_FILES_TSX = ['**/*.test.tsx', '**/*.spec.tsx'];

// ── Internal building blocks (not exported) ──────────────────────────────────

/**
 * Core config: ES2022 globals (without browser!), plugins, base rules.
 * @type {import('eslint').Linter.Config}
 */
const coreConfig = {
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        globals: {
            ...globals.es2022
        }
    },
    plugins: {
        '@37bytes': plugins,
        'import-x': importPlugin,
        'prefer-arrow-functions': preferArrowFunctions,
        unicorn: unicornPlugin,
        security: securityPlugin,
        promise: promisePlugin,
        sonarjs: sonarjsPlugin,
        regexp: regexpPlugin
    },
    settings: {
        // ExportMap сам открывает импортируемый файл, и без явного парсера он не умеет
        // читать .ts/.tsx: граф остаётся пустым, а no-cycle/named/no-deprecated молча
        // ничего не находят, оставаясь при этом включёнными
        'import-x/parsers': {
            [TS_PARSER_PATH]: ['.ts', '.tsx', '.mts', '.cts']
        },
        // резолвер передаётся объектом, а не именем: по имени import-x ищет пакет
        // eslint-import-resolver-typescript по дереву от линтуемого файла и от себя,
        // и промах обоих попаданий уводит его в фолбэк require('typescript'), который
        // грузит компилятор вместо резолвера и валит "Resolve error" на каждом импорте
        'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })]
    },
    rules: {
        ...javascript,
        ...imports,
        ...quality,
        ...regexp,
        '@37bytes/no-browser-storage': 'error'
    }
};

/**
 * Browser globals + DOM rules.
 * @type {import('eslint').Linter.Config}
 */
const browserConfig = {
    languageOptions: {
        globals: {
            ...globals.browser
        }
    },
    rules: {
        ...browser
    }
};

// ── Exported layer configs ───────────────────────────────────────────────────

/**
 * TypeScript configuration
 * @type {import('eslint').Linter.Config}
 */
export const typescriptConfig = {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
        parser: tsparser,
        parserOptions: {
            project: true
        }
    },
    plugins: {
        '@typescript-eslint': tseslint
    },
    rules: {
        ...typescript,
        '@37bytes/boolean-naming': 'error',
        '@37bytes/enum-pattern': 'error'
    }
};

/**
 * React configuration
 * @type {import('eslint').Linter.Config}
 */
export const reactConfig = {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true
            }
        }
    },
    plugins: {
        '@eslint-react': reactPlugin,
        '@stylistic': stylisticPlugin,
        'react-hooks': reactHooksPlugin
    },
    rules: {
        ...react,
        ...reactStylistic,
        '@37bytes/no-arrow-props': [
            'error',
            {
                allowInRefs: true,
                allowInRender: true
            }
        ]
    }
};

/**
 * Node.js configuration — eslint-plugin-n + node rules
 * @type {import('eslint').Linter.Config}
 */
export const nodeConfig = {
    languageOptions: {
        globals: {
            ...globals.nodeBuiltin
        }
    },
    plugins: {
        n: nodePlugin
    },
    rules: {
        ...node
    }
};

/**
 * CJS configuration — rules for CommonJS files only
 * @type {import('eslint').Linter.Config}
 */
export const nodeCjsConfig = {
    files: ['**/*.cjs'],
    rules: {
        ...nodeCjs
    }
};

/**
 * Override-объект с релакс-правилами для bootstrap-фазы кода — env-loader,
 * server entry-points, build scripts, migrations, seeds, codegen.
 *
 * Применяется через flat-config files-glob в consumer'ском
 * `eslint.config.mjs` к нужному срезу проекта. Не имеет встроенного
 * `files`: каждый проект решает сам, что у него bootstrap, а что
 * production runtime.
 *
 * Релакс-правила и bootstrap-паттерны, которые они поддерживают:
 *   - `n/no-process-env`: env-loader — это единственный source of truth,
 *     читающий `process.env` и отдающий валидированный конфиг.
 *   - `no-console`: ошибки валидации схемы до инициализации логгера
 *     уходят в `console.error` (stderr ловят systemd/PM2/Docker/k8s).
 *   - `n/no-process-exit`: `process.exit(1)` на невалидном конфиге это
 *     стандартный fast-fail bootstrap. Throw тоже работает, но exit
 *     одинаково легитимен.
 *   - `security/detect-non-literal-fs-filename`: пути вида
 *     `.env.${envName}` контролируются оператором (NODE_ENV, CLI-args),
 *     не end-user'ом. Threat model path traversal не применима.
 *
 * @example
 * import { nodejsRuntime, nodejsConfig } from '@37bytes/code-style/eslint';
 * export default [
 *     ...nodejsRuntime,
 *     {
 *         files: ['src/env.ts', 'src/server.ts', 'src/main.ts'],
 *         ...nodejsConfig
 *     }
 * ];
 *
 * @type {import('eslint').Linter.Config}
 */
export const nodejsConfig = {
    rules: {
        'n/no-process-env': 'off',
        'no-console': 'off',
        'n/no-process-exit': 'off',
        'security/detect-non-literal-fs-filename': 'off'
    }
};

// ── Next.js internal configs ─────────────────────────────────────────────────

/**
 * Next.js App Router rules
 * @type {import('eslint').Linter.Config}
 */
export const nextjsConfig = {
    plugins: {
        '@next/next': nextPlugin
    },
    rules: {
        ...nextjsRules
    }
};

/**
 * Next.js overrides — disable no-default-export for App Router conventions.
 *
 * Покрывает полный набор App Router special-файлов, обязанных иметь
 * default-export (см. https://nextjs.org/docs/app/api-reference/file-conventions):
 * UI-файлы (page/layout/...), global-error и metadata-файлы (sitemap/robots/...).
 *
 * NB: route.ts сюда НЕ входит. Route handlers экспортируют именованные
 * GET/POST/..., default-export в них — ошибка, и no-default-export должен её
 * ловить, а не гасить.
 *
 * @type {import('eslint').Linter.Config}
 */
const nextjsOverrides = {
    files: [
        // UI special-файлы (рендерят JSX → .tsx)
        '**/app/**/page.tsx',
        '**/app/**/layout.tsx',
        '**/app/**/loading.tsx',
        '**/app/**/error.tsx',
        '**/app/**/global-error.tsx',
        '**/app/**/not-found.tsx',
        '**/app/**/template.tsx',
        '**/app/**/default.tsx',
        // Metadata-файлы (default-export функции/объекта/компонента)
        '**/app/**/sitemap.ts',
        '**/app/**/robots.ts',
        '**/app/**/manifest.ts',
        '**/app/**/opengraph-image.{ts,tsx}',
        '**/app/**/twitter-image.{ts,tsx}',
        '**/app/**/icon.{ts,tsx}',
        '**/app/**/apple-icon.{ts,tsx}',
        // Bootstrap-файлы Next.js
        'middleware.ts',
        'instrumentation.ts',
        'next.config.*'
    ],
    rules: {
        'import-x/no-default-export': 'off',
        'import-x/no-anonymous-default-export': 'off'
    }
};

/**
 * Override для Next.js server-side кода — расширение `nodejsConfig` с
 * pre-configured glob для типичных server-only файлов App Router и
 * Pages Router.
 *
 * Применяется как готовый flat-config item:
 *
 * @example
 * import { nextjs, nextjsServerConfig } from '@37bytes/code-style/eslint';
 * export default [...nextjs, nextjsServerConfig];
 *
 * Покрывает:
 *   - App Router server файлы (`page.tsx`, `layout.tsx`, `route.ts`, и т.д.)
 *   - Pages Router API routes (`pages/api/**`)
 *   - Bootstrap-файлы Next.js (`middleware.ts`, `instrumentation.ts`, `next.config.*`)
 *   - Файлы с явным naming `*.server.{ts,tsx}`
 *
 * Caveat: App Router page.tsx/layout.tsx могут быть помечены `'use client'`
 * — тогда релакс правил применится и к client-side коду в этих файлах.
 * Если нужна точность по директиве, замени pre-configured glob на свой
 * через копирование `nodejsConfig` напрямую.
 *
 * @type {import('eslint').Linter.Config}
 */
export const nextjsServerConfig = {
    files: [
        // App Router server-side
        '**/app/**/page.tsx',
        '**/app/**/layout.tsx',
        '**/app/**/loading.tsx',
        '**/app/**/error.tsx',
        '**/app/**/not-found.tsx',
        '**/app/**/template.tsx',
        '**/app/**/default.tsx',
        '**/app/**/route.ts',
        // Pages Router API
        '**/pages/api/**',
        // Bootstrap entry-points
        'middleware.ts',
        'instrumentation.ts',
        'next.config.*',
        // Explicit naming
        '**/*.server.{ts,tsx}'
    ],
    ...nodejsConfig
};

// ── Main configs ─────────────────────────────────────────────────────────────

/**
 * Isomorphic library config (no browser, no Node.js globals)
 * @type {import('eslint').Linter.Config[]}
 */
export const library = [coreConfig, typescriptConfig];

/**
 * Browser library config (browser APIs, no React)
 * @type {import('eslint').Linter.Config[]}
 */
export const browserLibrary = [coreConfig, browserConfig, typescriptConfig];

/**
 * React library config (browser APIs + React, no app-level rules)
 * @type {import('eslint').Linter.Config[]}
 */
export const reactLibrary = [coreConfig, browserConfig, typescriptConfig, reactConfig];

/**
 * SPA config (Vite + React)
 * @type {import('eslint').Linter.Config[]}
 */
export const spa = [coreConfig, browserConfig, typescriptConfig, reactConfig];

/**
 * Next.js config (React + App Router + Node.js).
 *
 * Strict baseline. Для server-side кода применяй также `nextjsServerConfig`
 * (pre-configured glob) или вручную композируй `nodejsConfig` со своим glob'ом.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nextjs = [...spa, nextjsConfig, nextjsOverrides, nodeConfig, nodeCjsConfig];

/**
 * Node.js runtime config — strict baseline для production-кода
 * (HTTP handlers, services, бизнес-логика, библиотечный код).
 *
 * Bootstrap-фазе (env-loader, server entry, scripts) применяй
 * `nodejsConfig` через flat-config files-glob поверх:
 *
 * @example
 * import { nodejsRuntime, nodejsConfig } from '@37bytes/code-style/eslint';
 * export default [
 *     ...nodejsRuntime,
 *     {
 *         files: ['src/env.ts', 'src/server.ts'],
 *         ...nodejsConfig
 *     }
 * ];
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nodejsRuntime = [coreConfig, typescriptConfig, nodeConfig, nodeCjsConfig];

/**
 * Node.js tool config — для CLI-утилит и one-shot скриптов, где **весь
 * код** считается bootstrap-like. Эквивалентно `[...nodejsRuntime, nodejsConfig]`
 * без file-glob.
 *
 * Семантически отдельная сущность от `nodejsConfig` (тот — override для
 * среза, этот — полноценный preset). Состав правил идентичен.
 *
 * @example
 * import { nodejsTool } from '@37bytes/code-style/eslint';
 * export default [...nodejsTool];
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nodejsTool = [...nodejsRuntime, nodejsConfig];

// ── Opt-in configs ───────────────────────────────────────────────────────────

/**
 * Testing config — Vitest rules + relaxed overrides for test files.
 * @type {import('eslint').Linter.Config}
 */
export const testingConfig = {
    files: TEST_FILES,
    plugins: {
        vitest: vitestPlugin
    },
    rules: {
        ...vitestRules,
        ...testOverrides,
        'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }]
    }
};

/**
 * Testing React config — Testing Library rules.
 * @type {import('eslint').Linter.Config}
 */
export const testingReactConfig = {
    files: TEST_FILES_TSX,
    plugins: {
        'testing-library': testingLibraryPlugin
    },
    rules: {
        ...testingLibraryRules
    }
};

/**
 * Storybook configuration — rules for story files (*.stories.*)
 * @type {import('eslint').Linter.Config}
 */
export const storybookConfig = {
    files: ['**/*.stories.js', '**/*.stories.jsx', '**/*.stories.ts', '**/*.stories.tsx'],
    plugins: {
        storybook: storybookPlugin
    },
    rules: {
        ...storybook,
        'import-x/no-default-export': 'off',
        'import-x/no-anonymous-default-export': 'off'
    }
};

/**
 * Storybook config-dir — rules for `.storybook/` (main.*, preview.*, ...).
 *
 * Отдельно от `storybookConfig`: story-ориентированные правила из набора
 * `storybook` (напр. `storybook/story-exports`, требующее хотя бы одну Story)
 * фолсят на config-файлах, где историй нет. Здесь только то, что относится к
 * самому конфигу Storybook:
 *   - `no-uninstalled-addons` — как раз читает `.storybook/main.*`;
 *   - релакс `no-default-export` / `no-anonymous-default-export` — main/preview
 *     обязаны default-экспортить;
 *   - релакс `no-extraneous-dependencies` — config-файлы легитимно импортят
 *     `@storybook/*` из devDependencies.
 *
 * Opt-in, добавляется рядом с `storybookConfig`:
 *
 * @example
 * import { nextjs, storybookConfig, storybookMainConfig } from '@37bytes/code-style/eslint';
 * export default [...nextjs, storybookConfig, storybookMainConfig];
 *
 * @type {import('eslint').Linter.Config}
 */
export const storybookMainConfig = {
    files: ['**/.storybook/**/*.{js,jsx,ts,tsx}'],
    plugins: {
        storybook: storybookPlugin
    },
    rules: {
        'storybook/no-uninstalled-addons': 'error',
        'import-x/no-default-export': 'off',
        'import-x/no-anonymous-default-export': 'off',
        'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }]
    }
};

/**
 * React Compiler config — rules for React Compiler support
 * @type {import('eslint').Linter.Config}
 */
export const reactCompilerConfig = {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
        ...reactCompiler
    }
};

// ── Perfectionist configs ────────────────────────────────────────────────────

/**
 * Perfectionist base config — auto-sorting imports, exports, types.
 * Disables conflicting import-x/order and import-x/first.
 * @type {import('eslint').Linter.Config}
 */
export const perfectionistBaseConfig = {
    plugins: {
        perfectionist: perfectionistPlugin
    },
    rules: {
        ...perfectionistRules,
        'import-x/order': 'off',
        'import-x/first': 'off'
    }
};

/**
 * Perfectionist React config — JSX props sorting.
 * Requires perfectionistBaseConfig for the plugin.
 * @type {import('eslint').Linter.Config}
 */
export const perfectionistReactConfig = {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
        ...perfectionistReact
    }
};

/**
 * Perfectionist namespace — ready-made configs per app type.
 */
export const perfectionist = {
    library: [...library, perfectionistBaseConfig],
    browserLibrary: [...browserLibrary, perfectionistBaseConfig],
    reactLibrary: [...reactLibrary, perfectionistBaseConfig, perfectionistReactConfig],
    spa: [...spa, perfectionistBaseConfig, perfectionistReactConfig],
    nextjs: [...nextjs, perfectionistBaseConfig, perfectionistReactConfig],
    nodejsRuntime: [...nodejsRuntime, perfectionistBaseConfig],
    nodejsTool: [...nodejsTool, perfectionistBaseConfig]
};
