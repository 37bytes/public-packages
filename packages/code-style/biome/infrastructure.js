/**
 * Biome configuration infrastructure
 *
 * Shared metadata used by build.js to assemble config.json.
 * Mirrors the pattern from oxlint/infrastructure.js.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const package_ = require('../package.json');

// Biome version from peerDependencies (e.g. ">=2.4.4" → "2.4.4")
export const biomeVersion = package_.peerDependencies['@biomejs/biome'].replaceAll(/[^0-9.]/g, '');
export const schema = `https://biomejs.dev/schemas/${biomeVersion}/schema.json`;

/**
 * Domains auto-activate based on dependencies in consumer's package.json.
 * 'all' = enable all rules for that domain (our whitelist is in rule files).
 */
export const domains = {
    react: 'all',
    next: 'all',
    test: 'all'
};

/**
 * Formatter settings aligned with our Prettier config
 */
export const formatter = {
    enabled: true,
    indentStyle: 'space',
    indentWidth: 4,
    lineWidth: 120,
    lineEnding: 'lf'
};

/**
 * JavaScript-specific formatter settings (placed under javascript.formatter in config)
 */
export const jsFormatter = {
    quoteStyle: 'single',
    trailingCommas: 'none',
    semicolons: 'always',
    quoteProperties: 'asNeeded',
    arrowParentheses: 'always'
};

/**
 * Override file patterns (used in config.overrides)
 */
export const overrideFiles = {
    typescript: ['**/*.ts', '**/*.tsx'],
    testing: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/test/**', '**/__tests__/**']
};
