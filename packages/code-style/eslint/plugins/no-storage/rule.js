/**
 * @fileoverview Rule to forbid the usage of localStorage and sessionStorage
 * @author 37bytes
 *
 * Browser storage (localStorage and sessionStorage) is forbidden because:
 * - It may be unavailable in some browsers or incognito mode
 * - It's not recommended for storing sensitive data
 * - Use dedicated storage abstractions instead
 */

const GLOBAL_OBJECTS = new Set(['window', 'globalThis', 'self']);

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Forbid the usage of sessionStorage and localStorage',
            category: 'Best Practices',
            recommended: true,
            url: 'https://github.com/37bytes/public-packages/tree/master/packages/configs'
        },
        messages: {
            noBrowserStorage:
                'Do not use browser storage (localStorage, sessionStorage). Use a dedicated storage abstraction instead.'
        },
        schema: []
    },
    create: (context) => {
        /**
         * Checks if the identifier is one of the forbidden storage APIs
         * @param {string} name - Identifier name
         * @returns {boolean} true if this is a forbidden storage
         */
        const isForbiddenStorage = (name) => name === 'localStorage' || name === 'sessionStorage';

        return {
            /**
             * Catches property access on storage objects:
             * - localStorage.getItem() — direct
             * - window.localStorage.getItem() — global prefix
             * - window.localStorage — standalone reference with prefix
             */
            MemberExpression: (node) => {
                // Case 1: localStorage.getItem()
                if (node.object.type === 'Identifier' && isForbiddenStorage(node.object.name)) {
                    context.report({ node, messageId: 'noBrowserStorage' });
                    return;
                }

                // Case 2: window.localStorage.getItem()
                if (
                    node.object.type === 'MemberExpression' &&
                    node.object.property.type === 'Identifier' &&
                    isForbiddenStorage(node.object.property.name) &&
                    node.object.object.type === 'Identifier' &&
                    GLOBAL_OBJECTS.has(node.object.object.name)
                ) {
                    context.report({ node, messageId: 'noBrowserStorage' });
                    return;
                }

                // Case 3: window.localStorage (standalone, no further property access)
                if (
                    node.property.type === 'Identifier' &&
                    isForbiddenStorage(node.property.name) &&
                    node.object.type === 'Identifier' &&
                    GLOBAL_OBJECTS.has(node.object.name) &&
                    (!node.parent || node.parent.type !== 'MemberExpression' || node.parent.object !== node)
                ) {
                    context.report({ node, messageId: 'noBrowserStorage' });
                }
            },

            /**
             * Catches standalone identifiers: const s = localStorage, saveData(localStorage)
             * Excludes: property access (handled by MemberExpression), object property keys
             */
            Identifier: (node) => {
                if (
                    isForbiddenStorage(node.name) &&
                    node.parent &&
                    node.parent.type !== 'MemberExpression' &&
                    !(node.parent.type === 'Property' && node.parent.key === node && !node.parent.shorthand)
                ) {
                    context.report({ node, messageId: 'noBrowserStorage' });
                }
            }
        };
    }
};
