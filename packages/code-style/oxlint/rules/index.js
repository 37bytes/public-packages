/**
 * @fileoverview OxLint rule modules index
 *
 * Re-exports all rule sets for the build script and programmatic use.
 */

export { browser } from '#oxlint/rules/browser';
export { custom } from '#oxlint/rules/custom';
export { imports } from '#oxlint/rules/imports';
// Base rules (merged into top-level 'rules')
export { javascript } from '#oxlint/rules/javascript';
export { nextjs } from '#oxlint/rules/nextjs';
export { node } from '#oxlint/rules/node';
// Perfectionist (separate config)
export { perfectionist, perfectionistImportOverrides, perfectionistJsPlugin } from '#oxlint/rules/perfectionist';
export { quality } from '#oxlint/rules/quality';
export { react } from '#oxlint/rules/react';

export { regexp } from '#oxlint/rules/regexp';
export { storybook } from '#oxlint/rules/storybook';
export { testing } from '#oxlint/rules/testing';

// Override rules
export { typescriptDisables, typescriptRules } from '#oxlint/rules/typescript';
