/**
 * @fileoverview OxLint rule modules index
 *
 * Re-exports all rule sets for the build script and programmatic use.
 */

export { browser } from './browser.js';
export { custom } from './custom.js';
export { imports } from './imports.js';
// Base rules (merged into top-level 'rules')
export { javascript } from './javascript.js';
export { nextjs } from './nextjs.js';
export { node } from './node.js';
// Perfectionist (separate config)
export { perfectionist, perfectionistImportOverrides, perfectionistJsPlugin } from './perfectionist.js';
export { quality } from './quality.js';
export { react } from './react.js';

export { regexp } from './regexp.js';
export { storybook } from './storybook.js';
export { testing } from './testing.js';

// Override rules
export { typescriptDisables, typescriptRules } from './typescript.js';
