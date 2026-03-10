/**
 * Central re-export hub for all Biome rule modules.
 * Used by build.js to assemble config.json.
 */

export { imports } from './imports.js';
// Base rules (merged into main config by category)
export { javascript, javascriptNursery } from './javascript.js';
export { nextjs } from './nextjs.js';
export { quality } from './quality.js';
export { react, reactNursery } from './react.js';
// Override rules (applied to specific file patterns)
export { testing } from './testing.js';

export { typescript, typescriptNursery, typescriptOverrides } from './typescript.js';
