import { nodejs } from '@37bytes/code-style/eslint';

export default [
    {
        ignores: ['node_modules/**', 'legacy/**', 'packages/**', 'core/**', '.gitHooks/**']
    },
    ...nodejs,
    {
        // root scripts: no package boundaries, default exports are fine
        rules: {
            'no-console': 'off',
            'import-x/no-default-export': 'off',
            'import-x/no-anonymous-default-export': 'off',
            'import-x/no-extraneous-dependencies': 'off'
        }
    }
];
