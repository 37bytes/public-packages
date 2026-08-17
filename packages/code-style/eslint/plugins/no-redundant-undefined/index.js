import { rule } from '#eslint/plugins/no-redundant-undefined/rule';

export const RULE_NAME = 'no-redundant-undefined';

export default {
    rules: {
        [RULE_NAME]: rule
    }
};
