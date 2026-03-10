/**
 * @fileoverview Rule to forbid arrow functions in JSX props
 * @author 37bytes
 *
 * Arrow functions in JSX props can cause unnecessary re-renders
 * because a new function is created on each render.
 * Extract handlers to named functions or use useCallback.
 */

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow arrow functions in JSX props',
            category: 'Best Practices',
            recommended: true,
            url: 'https://github.com/37bytes/public-packages/tree/master/packages/configs'
        },
        messages: {
            noArrowProps:
                'Arrow functions are not allowed in JSX props. Extract it to a named function or use useCallback.'
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowInRefs: {
                        type: 'boolean',
                        default: false
                    },
                    allowInRender: {
                        type: 'boolean',
                        default: false
                    },
                    allowComponents: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        default: []
                    }
                },
                additionalProperties: false
            }
        ],
        fixable: null
    },
    create: (context) => {
        const options = context.options[0] || {};
        const allowInReferences = options.allowInRefs || false;
        const allowInRender = options.allowInRender || false;
        const allowComponents = options.allowComponents || [];

        /**
         * Gets the component name from a JSXAttribute's parent opening element
         * @param {import('eslint').Rule.Node} attrNode - JSXAttribute node
         * @returns {string|null} e.g. "Button", "motion.div"
         */
        const getComponentName = (attributeNode) => {
            const openingElement = attributeNode.parent;
            if (!openingElement || openingElement.type !== 'JSXOpeningElement') {
                return null;
            }

            const nameNode = openingElement.name;

            // <Button />
            if (nameNode.type === 'JSXIdentifier') {
                return nameNode.name;
            }

            // <motion.div />
            if (
                nameNode.type === 'JSXMemberExpression' &&
                nameNode.object.type === 'JSXIdentifier' &&
                nameNode.property.type === 'JSXIdentifier'
            ) {
                return `${nameNode.object.name}.${nameNode.property.name}`;
            }

            return null;
        };

        /**
         * Checks if the component matches any allowComponents pattern
         * Supports exact match ("Controller") and wildcard ("motion.*")
         * @param {string|null} componentName
         * @returns {boolean}
         */
        const isAllowedComponent = (componentName) => {
            if (!componentName) {
                return false;
            }

            for (const pattern of allowComponents) {
                if (pattern.endsWith('.*')) {
                    const prefix = pattern.slice(0, -2);
                    if (componentName.startsWith(`${prefix}.`) && componentName.length > prefix.length + 1) {
                        return true;
                    }
                } else if (pattern === componentName) {
                    return true;
                }
            }

            return false;
        };

        /**
         * Checks if the prop name is allowed based on options
         * @param {string} name - Prop name
         * @returns {boolean} true if prop is allowed
         */
        const isAllowedProperty = (name) => {
            if (allowInReferences && (name === 'ref' || name.endsWith('Ref'))) {
                return true;
            }

            if (allowInRender && (name === 'render' || name.startsWith('render'))) {
                return true;
            }

            return false;
        };

        return {
            /**
             * Checks JSX attributes for arrow functions in props.
             * Forbids arrow functions unless the prop or component is in the exception list.
             */
            JSXAttribute: (node) => {
                if (!node.value || node.value.type !== 'JSXExpressionContainer') {
                    return;
                }

                const expression = node.value.expression;
                const propertyName = node.name.name;

                if (isAllowedProperty(propertyName)) {
                    return;
                }

                if (isAllowedComponent(getComponentName(node))) {
                    return;
                }

                if (
                    expression.type === 'ArrowFunctionExpression' ||
                    (expression.type === 'CallExpression' &&
                        expression.callee &&
                        expression.callee.type === 'ArrowFunctionExpression')
                ) {
                    context.report({
                        node,
                        messageId: 'noArrowProps'
                    });
                }
            }
        };
    }
};
