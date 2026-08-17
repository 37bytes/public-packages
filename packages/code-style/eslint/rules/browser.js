/**
 * @fileoverview Browser environment ESLint rules
 * @author 37bytes
 *
 * Rules for browser-specific DOM/Web API code (unicorn subset).
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Browser rules for @37bytes projects
 * @type {import('eslint').Linter.RulesRecord}
 */
export const browser = {
    // === Unicorn: DOM & Browser APIs ===
    'unicorn/prefer-add-event-listener': 'warn',
    'unicorn/prefer-event-target': 'warn',
    'unicorn/no-document-cookie': 'error',
    'unicorn/no-invalid-remove-event-listener': 'error',
    'unicorn/prefer-dom-node-append': 'warn',
    'unicorn/dom-node-dataset': 'warn',
    'unicorn/prefer-dom-node-remove': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-keyboard-event-key': 'warn',
    'unicorn/prefer-modern-dom-apis': 'warn',
    'unicorn/prefer-query-selector': 'warn',
    'unicorn/prefer-classlist-toggle': 'warn',
    'unicorn/prefer-blob-reading-methods': 'warn',
    'unicorn/require-post-message-target-origin': 'warn',
    'unicorn/prefer-single-call': 'warn',
    'unicorn/prefer-response-static-json': 'warn'
};
