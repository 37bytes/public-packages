/**
 * @fileoverview ESLint config for this package (dogfooding)
 *
 * Uses our own nodejsRuntime baseline + nodejsConfig override for CLI
 * scripts + package-specific overrides.
 */

import { nodejsConfig, nodejsRuntime, testingConfig } from '#config';
import { perfectionist as perfectionistRules } from '#rules/perfectionist';

import perfectionistPlugin from 'eslint-plugin-perfectionist';

export default [
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            '__tests__/fixtures/**',
            // Vendored code: kept byte-identical to upstream (modulo ESM conversion)
            // to simplify future re-sync with eslint-plugin-promise. Linting it under
            // our own rules would drift from upstream and risk correctness regressions.
            'eslint/plugins/vendored-promise/**'
        ]
    },
    ...nodejsRuntime,
    // Perfectionist (opt-in for this package)
    {
        plugins: {
            perfectionist: perfectionistPlugin
        },
        rules: {
            ...perfectionistRules,
            'perfectionist/sort-imports': [
                'warn',
                {
                    type: 'natural',
                    order: 'asc',
                    ignoreCase: true,
                    internalPattern: ['^#'],
                    sortSideEffects: false,
                    newlinesBetween: 1,
                    groups: ['internal', 'builtin', 'external', ['parent', 'sibling', 'index'], 'side-effect', 'style']
                }
            ],
            'import-x/order': 'off',
            'import-x/first': 'off'
        }
    },
    // --- Overrides for config package ---
    {
        rules: {
            'import-x/no-default-export': 'off',
            'import-x/no-anonymous-default-export': 'off'
        }
    },
    // CJS files — allow module.exports and require
    {
        files: ['**/*.cjs'],
        languageOptions: {
            sourceType: 'commonjs'
        }
    },
    // CLI scripts — bootstrap-like phase (console, process.exit, dynamic fs paths)
    {
        files: ['.gitHooks/**', 'oxlint/build.js', 'biome/build.js'],
        ...nodejsConfig
    },
    // Rule/config files — rule names like 'no-hardcoded-passwords' trigger false positives
    {
        files: ['eslint/rules/**', 'oxlint/rules/**', 'biome/rules/**', 'eslint.config.js'],
        rules: {
            'sonarjs/no-hardcoded-passwords': 'off',
            'sonarjs/no-hardcoded-secrets': 'off'
        }
    },
    // Plugin rules (AST visitors) — allow higher complexity and nested functions
    {
        files: ['eslint/plugins/**/rule.js'],
        rules: {
            'sonarjs/cognitive-complexity': ['warn', 40],
            'unicorn/consistent-function-scoping': 'off'
        }
    },
    // Test files — testingConfig (vitest rules + relaxed overrides) + package-specific overrides
    testingConfig,
    {
        files: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/__tests__/**/*'],
        rules: {
            'no-unused-vars': 'off',
            'no-await-in-loop': 'off',
            'n/no-unsupported-features/node-builtins': 'off'
        }
    }
];
