/**
 * @fileoverview ESLint plugin to forbid arrow functions in JSX props
 * @author 37bytes
 */

import { rule } from './rule.js';

export const RULE_NAME = 'no-arrow-props';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
