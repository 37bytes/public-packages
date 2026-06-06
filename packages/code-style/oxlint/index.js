/**
 * @fileoverview OxLint configuration for @37bytes/code-style
 *
 * Usage:
 *   Recommended:  oxlint -c node_modules/@37bytes/code-style/oxlint/config.json
 *   With sorting: oxlint -c node_modules/@37bytes/code-style/oxlint/perfectionist.json
 *
 * Or copy to project root:
 *   cp node_modules/@37bytes/code-style/oxlint/config.json .oxlintrc.json
 *
 * Type-aware mode (requires oxlint-tsgolint):
 *   oxlint -c node_modules/@37bytes/code-style/oxlint/config.json --type-aware .
 *   Enables 10 type-aware rules (no-misused-promises, no-unsafe-*, etc.)
 *
 * Hybrid setup (OxLint + ESLint):
 *   import { typeAwareOverrides } from '@37bytes/code-style/oxlint/type-aware-overrides';
 *   Disables ESLint type-aware rules already covered by tsgolint.
 *
 * Limitations:
 *   - @37bytes/boolean-naming — requires TypeScript type info (not in tsgolint)
 *   - @typescript-eslint/naming-convention — not implemented in tsgolint
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (filename) =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- path is a build-time constant, not user input
    JSON.parse(readFileSync(join(import.meta.dirname, filename), 'utf8'));

export const config = readJson('./config.json');
export const perfectionistConfig = readJson('./perfectionist.json');
