/**
 * @fileoverview ESLint plugin to enforce boolean naming conventions
 * @author 37bytes
 *
 * NOTE: This plugin requires TypeScript type information to work correctly.
 * It must be used with @typescript-eslint/parser and parserOptions.project configured.
 */

import { rule } from '#eslint/plugins/boolean-naming/rule';

export const RULE_NAME = 'boolean-naming';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
