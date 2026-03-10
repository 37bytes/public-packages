/**
 * @fileoverview ESLint plugin: обязательный import 'server-only' в server.ts
 * @author 37bytes
 */

import { rule } from './rule.js';

export const RULE_NAME = 'require-server-only';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
