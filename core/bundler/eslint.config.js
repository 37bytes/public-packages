import { nodejs } from '@37bytes/code-style/eslint';

const config = [
    ...nodejs,
    {
        // config files use default exports by convention
        files: ['eslint.config.js'],
        rules: {
            'import-x/no-default-export': 'off',
            'import-x/no-anonymous-default-export': 'off'
        }
    }
];

export default config;
