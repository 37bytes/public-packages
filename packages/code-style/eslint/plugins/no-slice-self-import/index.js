/**
 * @fileoverview ESLint plugin: запрет импорта слайса через public API изнутри себя
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/no-slice-self-import/rule';

export const RULE_NAME = 'no-slice-self-import';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
