/**
 * @fileoverview ESLint plugin for enum patterns
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/enum-pattern/rule';

export const RULE_NAME = 'enum-pattern';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
