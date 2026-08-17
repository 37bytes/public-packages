/**
 * @fileoverview ESLint plugin: обязательный import 'server-only' в server.ts
 * @author 37bytes
 */

import { rule } from '#eslint/plugins/require-server-only/rule';

export const RULE_NAME = 'require-server-only';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
