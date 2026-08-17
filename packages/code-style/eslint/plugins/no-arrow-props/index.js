/**
 * @fileoverview ESLint plugin to forbid arrow functions in JSX props
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/no-arrow-props/rule';

export const RULE_NAME = 'no-arrow-props';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
