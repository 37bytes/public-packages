/**
 * @fileoverview Node.js rules for OxLint
 *
 * Maps to eslint/rules/node.js.
 * Note: OxLint uses 'node/' prefix (ESLint uses 'n/').
 * OxLint's node plugin is minimal — only 5 of 34 ESLint rules available.
 */

export const node = {
    'node/global-require': 'error',
    'node/no-exports-assign': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'node/no-process-env': 'warn'
};
