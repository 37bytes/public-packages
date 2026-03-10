import { browserLibrary } from '@37bytes/code-style/eslint';

const config = [
    { ignores: ['build/**', 'dist/**'] },
    ...browserLibrary,
    {
        files: ['eslint.config.js', 'tsdown.config.ts'],
        rules: {
            'import-x/no-extraneous-dependencies': 'off',
            'import-x/no-default-export': 'off'
        }
    }
];

export default config;
