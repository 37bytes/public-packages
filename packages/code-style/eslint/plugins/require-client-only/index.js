/**
 * @fileoverview ESLint plugin: обязательный import 'client-only' в client.ts
 * @author 37bytes
 */

import { rule } from './rule.js';

export const RULE_NAME = 'require-client-only';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
