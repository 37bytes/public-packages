/**
 * @fileoverview ESLint plugin to forbid browser storage APIs
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/no-storage/rule';

export const RULE_NAME = 'no-browser-storage';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
