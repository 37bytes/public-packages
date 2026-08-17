/**
 * @fileoverview Browser DOM rules for OxLint (unicorn DOM subset)
 *
 * Maps to eslint/rules/browser.js.
 */

export const browser = {
    'unicorn/prefer-add-event-listener': 'warn',
    'unicorn/prefer-event-target': 'warn',
    'unicorn/no-document-cookie': 'error',
    'unicorn/no-invalid-remove-event-listener': 'error',
    'unicorn/prefer-dom-node-append': 'warn',
    'unicorn/prefer-dom-node-dataset': 'warn',
    'unicorn/prefer-dom-node-remove': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-keyboard-event-key': 'warn',
    'unicorn/prefer-modern-dom-apis': 'warn',
    'unicorn/prefer-query-selector': 'warn',
    'unicorn/prefer-classlist-toggle': 'warn',
    'unicorn/require-post-message-target-origin': 'warn',
    'unicorn/prefer-single-call': 'warn',

    'unicorn/prefer-node-protocol': 'warn'
};
