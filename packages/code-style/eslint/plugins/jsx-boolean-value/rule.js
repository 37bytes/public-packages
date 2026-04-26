/**
 * @fileoverview Rule to forbid explicit `={true}` on JSX boolean props
 * @author 37bytes
 *
 * Equivalent to react/jsx-boolean-value with option 'never'.
 * Required because @eslint-react and @stylistic/eslint-plugin-jsx do not ship this rule.
 *
 * Limitation: false is meaningful (`disabled={false}` ≠ `disabled`), so this rule
 * only flags `={true}`. Non-literal expressions (`{value}`, `{!flag}`) are ignored.
 */

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Forbid explicit `={true}` on JSX boolean props (use shorthand)',
            recommended: true,
            url: 'https://github.com/37bytes/public-packages/tree/master/packages/code-style/eslint/plugins/jsx-boolean-value'
        },
        fixable: 'code',
        schema: [],
        messages: {
            redundantTrue: 'Boolean prop `{{name}}={true}` should be written as `{{name}}`.'
        }
    },
    create: (context) => ({
        JSXAttribute: (node) => {
            const value = node.value;
            if (
                !value ||
                value.type !== 'JSXExpressionContainer' ||
                value.expression.type !== 'Literal' ||
                value.expression.value !== true
            ) {
                return;
            }

            context.report({
                node,
                messageId: 'redundantTrue',
                data: { name: context.sourceCode.getText(node.name) },
                fix: (fixer) => fixer.removeRange([node.name.range[1], value.range[1]])
            });
        }
    })
};
