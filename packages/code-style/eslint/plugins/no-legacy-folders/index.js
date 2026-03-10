/**
 * @fileoverview ESLint plugin: запрет устаревших папок-свалок
 * @author 37bytes
 */

import { rule } from './rule.js';

export const RULE_NAME = 'no-legacy-folders';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
