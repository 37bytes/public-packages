import { perfectionist } from '@37bytes/code-style/eslint';

const config = [
    {
        ignores: ['build/**']
    },
    ...perfectionist.library,
    {
        rules: {
            // library re-exports named exports, no default export convention needed
            'import-x/no-default-export': 'off'
        }
    },
    {
        // config files use default exports by convention (eslint, tsdown)
        // and import devDependencies that aren't listed in "dependencies"
        files: ['eslint.config.js', 'tsdown.config.ts'],
        rules: {
            'import-x/no-extraneous-dependencies': 'off',
            'import-x/no-default-export': 'off',
            'import-x/no-anonymous-default-export': 'off'
        }
    }
];

export default config;
