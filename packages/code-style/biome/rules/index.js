/**
 * Central re-export hub for all Biome rule modules.
 * Used by build.js to assemble config.json.
 */

export { imports } from '#biome/rules/imports';
// Base rules (merged into main config by category)
export { javascript } from '#biome/rules/javascript';
export { nextjs } from '#biome/rules/nextjs';
export { quality } from '#biome/rules/quality';
export { react } from '#biome/rules/react';
// Override rules (applied to specific file patterns)
export { testing } from '#biome/rules/testing';

export { typescript, typescriptNursery, typescriptOverrides } from '#biome/rules/typescript';
