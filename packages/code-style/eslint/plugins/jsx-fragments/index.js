/**
 * @fileoverview ESLint plugin to enforce shorthand JSX fragment syntax
 * @author 37bytes
 */

import { rule } from './rule.js';

export const RULE_NAME = 'jsx-fragments';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
