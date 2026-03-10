/**
 * @fileoverview Rule to enforce enum-like patterns with `as const` objects
 * @author 37bytes
 *
 * This rule:
 * 1. Forbids TypeScript enums (use `as const` objects instead)
 * 2. Requires SCREAMING_SNAKE_CASE for objects with `as const`
 *
 * @example
 * // ❌ Bad - TypeScript enum
 * enum Status { READY, FAILED }
 * const enum Direction { UP, DOWN }
 *
 * // ❌ Bad - wrong naming
 * const status = { READY: 'READY', FAILED: 'FAILED' } as const;
 *
 * // ✅ Good
 * const STATUS = { READY: 'READY', FAILED: 'FAILED' } as const;
 */

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Forbid TypeScript enums and require SCREAMING_SNAKE_CASE for `as const` objects',
            category: 'Naming Conventions',
            recommended: true,
            url: 'https://github.com/37bytes/public-packages/tree/master/packages/configs/NAMING_CONVENTIONS.md'
        },
        messages: {
            noEnum: 'TypeScript enums are forbidden. Use `as const` object instead: `const {{ suggestion }} = { ... } as const;`',
            notScreamingCase:
                'Const object with `as const` should be named in SCREAMING_SNAKE_CASE (e.g. {{ suggestion }}).'
        },
        schema: []
    },
    create: (context) => {
        /**
         * Checks if the expression is an object with `as const` assertion
         * @param {object} init - The initializer node
         * @returns {boolean}
         */
        const isAsConstObject = (init) => {
            if (!init) {
                return false;
            }

            // Handle: { ... } as const
            if (init.type === 'TSAsExpression') {
                const { expression, typeAnnotation } = init;

                // Check if typeAnnotation is TSTypeReference with 'const'
                if (
                    typeAnnotation &&
                    typeAnnotation.type === 'TSTypeReference' &&
                    typeAnnotation.typeName &&
                    typeAnnotation.typeName.type === 'Identifier' &&
                    typeAnnotation.typeName.name === 'const'
                ) {
                    return expression && expression.type === 'ObjectExpression';
                }
            }

            // Handle: <const> { ... } (older syntax)
            if (init.type === 'TSTypeAssertion') {
                const { expression, typeAnnotation } = init;

                if (
                    typeAnnotation &&
                    typeAnnotation.type === 'TSTypeReference' &&
                    typeAnnotation.typeName &&
                    typeAnnotation.typeName.type === 'Identifier' &&
                    typeAnnotation.typeName.name === 'const'
                ) {
                    return expression && expression.type === 'ObjectExpression';
                }
            }

            return false;
        };

        /**
         * Checks if name is in SCREAMING_SNAKE_CASE
         * @param {string} name
         * @returns {boolean}
         */
        const isScreamingSnakeCase = (name) => /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(name);

        /**
         * Converts name to SCREAMING_SNAKE_CASE
         * @param {string} name
         * @returns {string}
         */
        const toScreamingSnakeCase = (name) =>
            name
                // Insert underscore before uppercase letters that follow lowercase
                .replaceAll(/([a-z])([A-Z])/g, '$1_$2')
                // Insert underscore before uppercase letters that are followed by lowercase
                .replaceAll(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                .toUpperCase();

        return {
            // Forbid TypeScript enums
            TSEnumDeclaration: (node) => {
                const enumName = node.id && node.id.name ? node.id.name : 'ENUM_NAME';
                const suggestion = toScreamingSnakeCase(enumName);

                context.report({
                    node,
                    messageId: 'noEnum',
                    data: { suggestion }
                });
            },

            // Require SCREAMING_SNAKE_CASE for `as const` objects
            VariableDeclaration: (node) => {
                if (node.kind !== 'const') {
                    return;
                }

                for (const decl of node.declarations) {
                    if (
                        decl.id &&
                        decl.id.type === 'Identifier' &&
                        isAsConstObject(decl.init) &&
                        !isScreamingSnakeCase(decl.id.name)
                    ) {
                        context.report({
                            node: decl.id,
                            messageId: 'notScreamingCase',
                            data: {
                                suggestion: toScreamingSnakeCase(decl.id.name)
                            }
                        });
                    }
                }
            }
        };
    }
};
