/**
 * @fileoverview ESLint plugin to forbid explicit `={true}` on JSX boolean props
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/jsx-boolean-value/rule';

export const RULE_NAME = 'jsx-boolean-value';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
