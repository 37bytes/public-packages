/**
 * @fileoverview ESLint plugin: запрет импорта слайса через public API изнутри себя
 * @author 37bytes
 */

import { rule } from './rule.js';

export const RULE_NAME = 'no-slice-self-import';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
