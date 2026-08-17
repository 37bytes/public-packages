/**
 * @fileoverview ESLint plugin: запрет устаревших папок-свалок
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/no-legacy-folders/rule';

export const RULE_NAME = 'no-legacy-folders';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
