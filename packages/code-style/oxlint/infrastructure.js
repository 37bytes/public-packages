/**
 * @fileoverview OxLint config infrastructure — plugins, environment, schema
 *
 * Metadata shared between config.json and perfectionist.json builds.
 */

export const schema = './node_modules/oxlint/configuration_schema.json';

export const plugins = [
    'typescript',
    'import',
    'unicorn',
    'promise',
    'react',
    'nextjs',
    'node',
    'vitest',
    'jest',
    'oxc'
];

export const jsPlugins = [
    { name: '@37bytes/no-arrow-props', specifier: './eslint/plugins/no-arrow-props/index.js' },
    { name: '@37bytes/no-storage', specifier: './eslint/plugins/no-storage/index.js' },
    { name: '@37bytes/enum-pattern', specifier: './eslint/plugins/enum-pattern/index.js' },
    { name: 'sonarjs', specifier: 'eslint-plugin-sonarjs' },
    { name: 'regexp', specifier: 'eslint-plugin-regexp' },
    { name: 'storybook', specifier: 'eslint-plugin-storybook' }
];

export const env = { browser: true, es2022: true, node: true };

export const categories = {};

export const overrideFiles = {
    typescript: ['**/*.ts', '**/*.tsx'],
    testing: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/test/**', '**/__tests__/**'],
    storybook: ['**/*.stories.tsx', '**/*.stories.ts'],
    // Next.js App Router conventions require default exports — mirror ESLint's nextjsOverrides
    nextjsAppRouter: [
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
    ]
};
