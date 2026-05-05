/**
 * @fileoverview Main ESLint configuration
 * @author 37bytes
 *
 * Four application-type configs: spa, nextjs, nodejs, tool.
 * Opt-in layers: testingConfig, testingReactConfig, storybookConfig,
 * reactCompilerConfig, createFSDConfig, createRestrictedImportsConfig.
 * Perfectionist namespace: perfectionist.spa, perfectionist.nextjs, perfectionist.nodejs.
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

import reactPlugin from '@eslint-react/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vitestPlugin from '@vitest/eslint-plugin';
import importPlugin from 'eslint-plugin-import-x';
import nodePlugin from 'eslint-plugin-n';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import regexpPlugin from 'eslint-plugin-regexp';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import storybookPlugin from 'eslint-plugin-storybook';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';

import promisePlugin from './plugins/vendored-promise/index.js';

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
        'import-x/resolver': {
            typescript: {
                alwaysTryTypes: true
            }
        }
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
 * Override for env-loader files — allow process.env.
 *
 * Whitelists files named `env.{js,ts,mjs,cjs}` or `environment.{js,ts,mjs,cjs}`
 * anywhere in the project. The naming convention is intentional: if a file
 * needs to read process.env, name it accordingly. Multi-file env-loader
 * patterns (e.g. `getAppEnvironment.ts`, `getBuildTimeEnvironment.ts`) are
 * not whitelisted — consumers either rename to fit the convention, merge
 * into a single file, or extend the override locally.
 *
 * @type {import('eslint').Linter.Config}
 */
export const nodeEnvOverride = {
    files: ['**/env.{js,ts,mjs,cjs}', '**/environment.{js,ts,mjs,cjs}'],
    rules: {
        'n/no-process-env': 'off'
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
 * Next.js overrides — disable no-default-export for App Router conventions
 * @type {import('eslint').Linter.Config}
 */
const nextjsOverrides = {
    files: [
        '**/app/**/page.tsx',
        '**/app/**/layout.tsx',
        '**/app/**/loading.tsx',
        '**/app/**/error.tsx',
        '**/app/**/not-found.tsx',
        '**/app/**/template.tsx',
        '**/app/**/default.tsx',
        '**/app/**/route.ts',
        'middleware.ts',
        'instrumentation.ts',
        'next.config.*'
    ],
    rules: {
        'import-x/no-default-export': 'off',
        'import-x/no-anonymous-default-export': 'off'
    }
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
 * Next.js config (React + App Router + Node.js)
 * @type {import('eslint').Linter.Config[]}
 */
export const nextjs = [...spa, nextjsConfig, nextjsOverrides, nodeConfig, nodeCjsConfig, nodeEnvOverride];

/**
 * Node.js config (scripts, utilities, plugins)
 * @type {import('eslint').Linter.Config[]}
 */
export const nodejs = [coreConfig, typescriptConfig, nodeConfig, nodeCjsConfig, nodeEnvOverride];

/**
 * Tool/CLI overrides — relaxed rules for small CLI utilities.
 * @type {import('eslint').Linter.Config}
 */
const toolOverrides = {
    rules: {
        'n/no-process-exit': 'off',
        'security/detect-non-literal-fs-filename': 'off'
    }
};

/**
 * Tool/CLI config — nodejs with relaxed rules for small CLI utilities.
 * @type {import('eslint').Linter.Config[]}
 */
export const tool = [...nodejs, toolOverrides];

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
 * Storybook configuration — rules for story files
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
    nodejs: [...nodejs, perfectionistBaseConfig],
    tool: [...tool, perfectionistBaseConfig]
};
