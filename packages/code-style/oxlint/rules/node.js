/**
 * @fileoverview Node.js rules for OxLint
 *
 * Maps to eslint/rules/node.js.
 * Note: OxLint uses 'node/' prefix (ESLint uses 'n/').
 * OxLint's node plugin is minimal — only 7 of 34 ESLint rules available.
 */

export const node = {
    'node/callback-return': 'warn', // available since oxlint 1.68.0; eslint: n/callback-return
    'node/global-require': 'error',
    'node/no-exports-assign': 'error',
    'node/no-mixed-requires': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'node/no-process-env': 'warn'
};
