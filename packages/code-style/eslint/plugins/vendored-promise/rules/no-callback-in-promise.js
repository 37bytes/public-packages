/**
 * Rule: no-callback-in-promise
 * Avoid calling back inside of a promise
 */

import { getAncestors } from '../lib/eslint-compat.js';
import getDocsUrl from '../lib/get-docs-url.js';
import hasPromiseCallback from '../lib/has-promise-callback.js';
import isCallback from '../lib/is-callback.js';
import isInsidePromise from '../lib/is-inside-promise.js';

const CB_BLACKLIST = ['callback', 'cb', 'next', 'done'];
const TIMEOUT_WHITELIST = ['setImmediate', 'setTimeout', 'requestAnimationFrame', 'nextTick'];

const isInsideTimeout = (node) => {
    const isFunctionExpression = node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
    const parent = node.parent || {};
    const callee = parent.callee || {};
    const name = (callee.property && callee.property.name) || callee.name || '';
    const parentIsTimeout = TIMEOUT_WHITELIST.includes(name);
    const isInCB = isFunctionExpression && parentIsTimeout;
    return isInCB;
};

export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow calling `cb()` inside of a `then()` (use [util.callbackify][] instead).',
            url: getDocsUrl('no-callback-in-promise')
        },
        messages: {
            callback: 'Avoid calling back inside of a promise.'
        },
        schema: [
            {
                type: 'object',
                properties: {
                    exceptions: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    timeoutsErr: {
                        type: 'boolean'
                    }
                },
                additionalProperties: false
            }
        ]
    },
    create(context) {
        const { timeoutsErr = false } = context.options[0] || {};

        return {
            CallExpression(node) {
                const options = context.options[0] || {};
                const exceptions = options.exceptions || [];
                if (!isCallback(node, exceptions)) {
                    const name = node.arguments?.[0]?.name;
                    if (hasPromiseCallback(node)) {
                        const callingName = node.callee.name || node.callee.property?.name;
                        if (
                            !exceptions.includes(name) &&
                            CB_BLACKLIST.includes(name) &&
                            (timeoutsErr || !TIMEOUT_WHITELIST.includes(callingName))
                        ) {
                            context.report({
                                node: node.arguments[0],
                                messageId: 'callback'
                            });
                        }
                        return;
                    }
                    if (!timeoutsErr) {
                        return;
                    }

                    if (!name) {
                        // Will be handled elsewhere
                        return;
                    }
                }

                const ancestors = getAncestors(context, node);
                if (ancestors.some(isInsidePromise) && (timeoutsErr || !ancestors.some(isInsideTimeout))) {
                    context.report({
                        node,
                        messageId: 'callback'
                    });
                }
            }
        };
    }
};
