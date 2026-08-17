/**
 * @fileoverview Rule to enforce shorthand JSX fragment syntax
 * @author 37bytes
 *
 * Equivalent to react/jsx-fragments with option 'syntax'.
 * Required because @eslint-react and @stylistic/eslint-plugin-jsx do not ship this rule.
 *
 * Limitation: matches `Fragment` as a JSX identifier without checking imports.
 * If a user defines their own component named `Fragment`, this rule will misfire.
 * Workaround: rename the component or disable the rule on the line.
 */

const isFragmentName = (nameNode) => {
    if (nameNode.type === 'JSXIdentifier' && nameNode.name === 'Fragment') {
        return true;
    }
    if (
        nameNode.type === 'JSXMemberExpression' &&
        nameNode.object.type === 'JSXIdentifier' &&
        nameNode.object.name === 'React' &&
        nameNode.property.type === 'JSXIdentifier' &&
        nameNode.property.name === 'Fragment'
    ) {
        return true;
    }
    return false;
};

/** @type {import('eslint').Rule.RuleModule} */
export const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Prefer shorthand `<>...</>` over `<React.Fragment>...</React.Fragment>`',
            recommended: true,
            url: 'https://github.com/37bytes/public-packages/tree/master/packages/code-style/eslint/plugins/jsx-fragments'
        },
        fixable: 'code',
        schema: [],
        messages: {
            preferShorthand: 'Use shorthand fragment syntax `<></>` instead of `<{{name}}>`.'
        }
    },
    create: (context) => ({
        JSXElement: (node) => {
            const opening = node.openingElement;

            if (!isFragmentName(opening.name)) {
                return;
            }

            // Shorthand <></> cannot carry attributes (no key, no others).
            // Long form with attributes is the only legal way; leave it alone.
            if (opening.attributes.length > 0) {
                return;
            }

            context.report({
                node,
                messageId: 'preferShorthand',
                data: { name: context.sourceCode.getText(opening.name) },
                fix: (fixer) => [fixer.replaceText(opening, '<>'), fixer.replaceText(node.closingElement, '</>')]
            });
        }
    })
};
