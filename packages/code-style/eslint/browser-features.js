/**
 * @fileoverview Browser features compatibility config for ESLint
 * @author 37bytes
 *
 * Uses eslint-plugin-compat to lint browser API usage against the project's
 * browserslist targets. Opt-in config, similar to createFSDConfig.
 *
 * Intended for browser-facing code (SPA, browserLibrary).
 * NOT for nodejs/library presets (server code).
 *
 * @example
 * // eslint.config.mjs
 * import { spa, browserFeaturesConfig } from '@37bytes/code-style/eslint';
 *
 * export default [
 *     ...spa,
 *     ...browserFeaturesConfig()
 * ];
 */

import compat from 'eslint-plugin-compat';

/**
 * Creates ESLint flat config for browser API compatibility checking.
 *
 * The plugin reads browserslist from the project's package.json or .browserslistrc.
 *
 * @returns {Array<import('eslint').Linter.Config>} Flat config objects array
 */
export const browserFeaturesConfig = () => [
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            compat
        },
        rules: {
            'compat/compat': 'warn'
        }
    }
];
