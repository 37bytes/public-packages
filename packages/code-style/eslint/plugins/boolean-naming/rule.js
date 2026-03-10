/**
 * @fileoverview Rule to enforce naming conventions for boolean variables
 * @author 37bytes
 *
 * This rule enforces that all boolean variables have a prefix (is, has, should, can, did, will, are).
 * When destructuring boolean properties without a prefix, they must be renamed with a prefix.
 * Supports union types with undefined and null.
 *
 * IMPORTANT: This rule requires TypeScript type information to work correctly.
 */

import { ESLintUtils } from '@typescript-eslint/utils';
import ts from 'typescript';

const BOOLEAN_PREFIX_RE = /^(?:is|has|should|can|did|will|are)[A-Z]/;

/**
 * Checks if a type is boolean (including union types with undefined and null)
 * @param {import('typescript').Type} type
 * @returns {boolean}
 */
const isBooleanType = (type) => {
    try {
        if (!type) {
            return false;
        }

        const { TypeFlags } = ts;

        // Check for Boolean symbol name (covers wrapper type)
        if (type.symbol?.name === 'Boolean') {
            return true;
        }

        // Check boolean flags (covers 99% of cases)
        if ((type.flags & TypeFlags.Boolean) !== 0 || (type.flags & TypeFlags.BooleanLiteral) !== 0) {
            return true;
        }

        // Check union types (e.g., boolean | undefined)
        if (type.isUnion?.()) {
            let hasBoolean = false;
            let hasNonNullableNonBoolean = false;

            for (const subType of type.types) {
                if ((subType.flags & TypeFlags.Boolean) !== 0 || (subType.flags & TypeFlags.BooleanLiteral) !== 0) {
                    hasBoolean = true;
                } else if ((subType.flags & TypeFlags.Undefined) === 0 && (subType.flags & TypeFlags.Null) === 0) {
                    hasNonNullableNonBoolean = true;
                }
            }

            return hasBoolean && !hasNonNullableNonBoolean;
        }

        // Fallback: intrinsic name
        if (type.intrinsicName === 'boolean') {
            return true;
        }

        return false;
    } catch {
        return false;
    }
};

/**
 * Checks if a variable name has a valid boolean prefix
 * @param {string} name
 * @returns {boolean}
 */
const hasBooleanPrefix = (name) => (name ? BOOLEAN_PREFIX_RE.test(name) : false);

/**
 * Capitalizes the first letter of a string
 * @param {string} str
 * @returns {string}
 */
const capitalize = (string_) => {
    if (!string_) {
        return '';
    }
    return string_.charAt(0).toUpperCase() + string_.slice(1);
};

/**
 * Creates a fix for destructuring by adding a prefix
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('estree').Property} property
 * @param {string} originalName
 * @returns {import('eslint').Rule.Fix}
 */
const fixDestructuring = (fixer, property, originalName) => {
    const capitalizedName = capitalize(originalName);
    // If there's already a rename, only replace the new name
    if (!property.shorthand && property.value.type === 'Identifier') {
        return fixer.replaceText(property.value, `is${capitalizedName}`);
    }
    // Otherwise replace shorthand with full rename
    return fixer.replaceText(property, `${originalName}: is${capitalizedName}`);
};

/**
 * Create rule with RuleCreator
 */
const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/37bytes/public-packages/tree/master/packages/configs#${name}`
);

export const rule = createRule({
    name: 'boolean-naming',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce consistent naming for boolean variables and properties',
            recommended: 'recommended',
            requiresTypeChecking: true
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    prefixes: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            booleanVariablePrefix:
                'Boolean variable "{{name}}" should have a prefix (is, has, should, can, did, will, are)',
            booleanFunctionPrefix:
                'Boolean function "{{name}}" should have a prefix (is, has, should, can, did, will, are)',
            booleanParameterPrefix:
                'Boolean parameter "{{name}}" should have a prefix (is, has, should, can, did, will, are)',
            booleanDestructuringRename:
                'Boolean property "{{name}}" should be renamed with a prefix during destructuring (e.g., { {{name}}: is{{capitalizedName}} })'
        }
    },
    defaultOptions: [],
    create: (context) => {
        const parserServices = ESLintUtils.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();

        /**
         * Gets TypeScript type for an ESTree node
         */
        const getNodeType = (node) => {
            try {
                const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
                if (!tsNode) {
                    return null;
                }
                return checker.getTypeAtLocation(tsNode);
            } catch {
                return null;
            }
        };

        /**
         * Gets property type from an object
         */
        const getPropertyType = (objectNode, propertyName) => {
            try {
                const tsNode = parserServices.esTreeNodeToTSNodeMap.get(objectNode);
                if (!tsNode) {
                    return null;
                }
                const objectType = checker.getTypeAtLocation(tsNode);
                const property = objectType.getProperty(propertyName);
                if (!property) {
                    return null;
                }
                return checker.getTypeOfSymbolAtLocation(property, tsNode);
            } catch {
                return null;
            }
        };

        /**
         * Checks function parameters for boolean naming.
         * Function return type is NOT checked — names like checkIsProduction,
         * validateForm, toggleVisibility are legitimate for boolean-returning functions.
         */
        const checkFunctionParameters = (node) => {
            // Check parameters
            for (const parameter of node.params) {
                if (parameter.type !== 'Identifier') {
                    continue;
                }
                if (hasBooleanPrefix(parameter.name)) {
                    continue;
                }
                const parameterType = getNodeType(parameter);
                if (parameterType && isBooleanType(parameterType)) {
                    context.report({
                        node: parameter,
                        messageId: 'booleanParameterPrefix',
                        data: { name: parameter.name }
                    });
                }
            }
        };

        /**
         * Checks destructured properties in function parameters.
         * Resolves paramType once, then checks each property against it.
         */
        const checkDestructuredParameter = (node) => {
            const functionNode = node.parent;
            const parameterIndex = functionNode.params.indexOf(node);
            if (parameterIndex === -1) {
                return;
            }

            const functionType = getNodeType(functionNode);
            if (!functionType) {
                return;
            }

            let parameterType;
            try {
                const signatures = checker.getSignaturesOfType(functionType, ts.SignatureKind.Call);
                if (!signatures?.length || signatures[0].parameters.length <= parameterIndex) {
                    return;
                }
                parameterType = checker.getDeclaredTypeOfSymbol(signatures[0].parameters[parameterIndex]);
            } catch {
                return;
            }

            if (!parameterType) {
                return;
            }

            for (const property of node.properties) {
                if (property.type !== 'Property' || property.key.type !== 'Identifier') {
                    continue;
                }

                const originalName = property.key.name;
                const renameNode = property.value;
                if (renameNode.type !== 'Identifier' || hasBooleanPrefix(renameNode.name)) {
                    continue;
                }

                try {
                    const propertySymbol = checker.getPropertyOfType(parameterType, originalName);
                    if (propertySymbol) {
                        const propertyType = checker.getTypeOfSymbolAtLocation(propertySymbol, renameNode);
                        if (propertyType && isBooleanType(propertyType)) {
                            context.report({
                                node: property.key,
                                messageId: 'booleanDestructuringRename',
                                data: {
                                    name: originalName,
                                    capitalizedName: capitalize(originalName)
                                },
                                fix: (fixer) => fixDestructuring(fixer, property, originalName)
                            });
                        }
                    }
                } catch {
                    // Ignore errors
                }
            }
        };

        return {
            VariableDeclarator: (node) => {
                if (!node.id || node.id.type !== 'Identifier') {
                    return;
                }

                const variableName = node.id.name;

                // Check type annotation (fast, syntactic only)
                if (node.id.typeAnnotation?.typeAnnotation) {
                    const typeNode = node.id.typeAnnotation.typeAnnotation;

                    if (
                        typeNode.type === 'TSBooleanKeyword' ||
                        (typeNode.type === 'TSTypeReference' && typeNode.typeName?.name === 'Boolean')
                    ) {
                        if (!hasBooleanPrefix(variableName)) {
                            context.report({
                                node: node.id,
                                messageId: 'booleanVariablePrefix',
                                data: { name: variableName },
                                fix: (fixer) => fixer.replaceText(node.id, `is${capitalize(variableName)}`)
                            });
                        }
                        return;
                    }
                }

                // Check for boolean literal (fast, syntactic only)
                if (node.init?.type === 'Literal' && typeof node.init.value === 'boolean') {
                    if (!hasBooleanPrefix(variableName)) {
                        context.report({
                            node: node.id,
                            messageId: 'booleanVariablePrefix',
                            data: { name: variableName },
                            fix: (fixer) => fixer.replaceText(node.id, `is${capitalize(variableName)}`)
                        });
                    }
                    return;
                }

                // Check based on TypeScript types (expensive — last resort)
                const nodeType = getNodeType(node.id);

                if (nodeType && isBooleanType(nodeType) && !hasBooleanPrefix(variableName)) {
                    context.report({
                        node: node.id,
                        messageId: 'booleanVariablePrefix',
                        data: { name: variableName },
                        fix: (fixer) => fixer.replaceText(node.id, `is${capitalize(variableName)}`)
                    });
                }
            },

            FunctionDeclaration: (node) => {
                checkFunctionParameters(node);
            },

            ArrowFunctionExpression: (node) => {
                checkFunctionParameters(node);
            },

            ObjectPattern: (node) => {
                // Destructuring in function parameters — resolve paramType once
                if (
                    node.parent &&
                    (node.parent.type === 'ArrowFunctionExpression' || node.parent.type === 'FunctionDeclaration')
                ) {
                    checkDestructuredParameter(node);
                    return;
                }

                // Destructuring from variable
                const objectNodeForType =
                    node.parent?.type === 'VariableDeclarator' && node.parent.init ? node.parent.init : null;

                if (!objectNodeForType) {
                    return;
                }

                for (const property of node.properties) {
                    if (property.type !== 'Property' || property.key.type !== 'Identifier') {
                        continue;
                    }

                    const originalName = property.key.name;
                    const renameNode = property.value;
                    if (renameNode.type !== 'Identifier' || hasBooleanPrefix(renameNode.name)) {
                        continue;
                    }

                    const propertyType = getPropertyType(objectNodeForType, originalName);
                    if (propertyType && isBooleanType(propertyType)) {
                        context.report({
                            node: property.key,
                            messageId: 'booleanDestructuringRename',
                            data: { name: originalName, capitalizedName: capitalize(originalName) },
                            fix: (fixer) => fixDestructuring(fixer, property, originalName)
                        });
                    }
                }
            }
        };
    }
});
