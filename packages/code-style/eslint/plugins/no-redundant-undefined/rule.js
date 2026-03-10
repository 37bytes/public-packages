/**
 * Ported from eslint-plugin-redundant-undefined (MIT, a-tarasyuk).
 * @type {import('eslint').Rule.RuleModule}
 */
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Forbid optional properties and parameters from including an explicit `undefined` in their type',
            recommended: true,
            url: 'https://github.com/37bytes/public-packages/tree/master/packages/code-style'
        },
        fixable: 'code',
        messages: {
            propertyOptionalError: 'Property is optional, so no need to include `undefined` in the type.',
            parameterOptionalError: 'Parameter is optional, so no need to include `undefined` in the type.'
        },
        schema: []
    },
    create: (context) => {
        /**
         * @param {import('estree').Node} node
         * @returns {boolean}
         */
        const isFunction = (node) =>
            node.type === 'FunctionDeclaration' ||
            node.type === 'FunctionExpression' ||
            node.type === 'ArrowFunctionExpression';

        /**
         * Checks whether a node is inside a function parameter list and marked optional
         * @param {import('estree').Node} node
         * @returns {boolean}
         */
        const isOptionalParam = (node) => {
            switch (node.type) {
                case 'Identifier':
                    return Boolean(
                        node.optional &&
                        node.parent &&
                        (node.parent.type === 'TSParameterProperty' || isFunction(node.parent))
                    );
                case 'TSUndefinedKeyword':
                case 'TSTypeAnnotation':
                case 'TSUnionType':
                    return Boolean(node.parent) && isOptionalParam(node.parent);
                default:
                    return false;
            }
        };

        /**
         * Checks whether a node is inside an optional property declaration
         * @param {import('estree').Node} node
         * @returns {boolean}
         */
        const isOptionalProperty = (node) => {
            switch (node.type) {
                case 'TSAbstractPropertyDefinition':
                case 'TSPropertySignature':
                case 'PropertyDefinition':
                    return Boolean(node.optional);
                case 'TSUndefinedKeyword':
                case 'TSTypeAnnotation':
                case 'TSUnionType':
                    return Boolean(node.parent) && isOptionalProperty(node.parent);
                default:
                    return false;
            }
        };

        /**
         * Creates a fixer that removes `undefined` from a union type or strips the whole annotation
         * @param {import('eslint').Rule.RuleFixer} fixer
         * @param {import('estree').Node} node - the TSUndefinedKeyword node
         * @returns {import('eslint').Rule.Fix | null}
         */
        const removeUndefinedFixer = (fixer, node) => {
            if (node.parent?.type === 'TSUnionType') {
                const types = node.parent.types;
                const typePos = types.indexOf(node);
                const prevType = types[typePos - 1];
                const nextType = types[typePos + 1];

                if (prevType) {
                    return fixer.removeRange([prevType.range[1], node.range[1]]);
                }

                if (nextType) {
                    return fixer.removeRange([node.range[0], nextType.range[0]]);
                }
            }

            // The only type is `undefined` itself, remove the whole annotation
            if (node.parent?.type === 'TSTypeAnnotation') {
                return fixer.removeRange(node.parent.range);
            }

            return null;
        };

        /**
         * Visitor for TSUndefinedKeyword nodes
         * @param {import('estree').Node} node
         */
        const checkUndefined = (node) => {
            if (isOptionalParam(node)) {
                context.report({
                    node,
                    messageId: 'parameterOptionalError',
                    fix: (fixer) => removeUndefinedFixer(fixer, node)
                });
            }

            if (isOptionalProperty(node)) {
                context.report({
                    node,
                    messageId: 'propertyOptionalError',
                    fix: (fixer) => removeUndefinedFixer(fixer, node)
                });
            }
        };

        return {
            TSUndefinedKeyword: checkUndefined
        };
    }
};
