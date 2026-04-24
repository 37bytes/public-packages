/**
 * @fileoverview Vendored eslint-plugin-promise (5 rules)
 *
 * See ./NOTICE.md for provenance and removal plan.
 */

import noCallbackInPromise from './rules/no-callback-in-promise.js';
import noMultipleResolved from './rules/no-multiple-resolved.js';
import noReturnInFinally from './rules/no-return-in-finally.js';
import preferAwaitToThen from './rules/prefer-await-to-then.js';
import specOnly from './rules/spec-only.js';

export default {
    rules: {
        'prefer-await-to-then': preferAwaitToThen,
        'no-return-in-finally': noReturnInFinally,
        'no-multiple-resolved': noMultipleResolved,
        'no-callback-in-promise': noCallbackInPromise,
        'spec-only': specOnly
    }
};
