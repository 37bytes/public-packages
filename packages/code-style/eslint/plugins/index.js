/**
 * @fileoverview Aggregated @37bytes ESLint plugins
 * @author 37bytes
 *
 * This module combines all custom ESLint plugins under the @37bytes namespace.
 * Usage: plugins: { '@37bytes': plugins }
 */

import booleanNamingPlugin from '#plugins/boolean-naming';
import enumPatternPlugin from '#plugins/enum-pattern';
import jsxBooleanValuePlugin from '#plugins/jsx-boolean-value';
import jsxFragmentsPlugin from '#plugins/jsx-fragments';
import noArrowPropsPlugin from '#plugins/no-arrow-props';
import noLegacyFoldersPlugin from '#plugins/no-legacy-folders';
import noRedundantUndefinedPlugin from '#plugins/no-redundant-undefined';
import noSliceSelfImportPlugin from '#plugins/no-slice-self-import';
import noStoragePlugin from '#plugins/no-storage';
import requireClientOnlyPlugin from '#plugins/require-client-only';
import requireServerOnlyPlugin from '#plugins/require-server-only';

// Rule name constants for easy reference
export const RULE_NO_STORAGE = 'no-browser-storage';
export const RULE_NO_ARROW_PROPS = 'no-arrow-props';
export const RULE_BOOLEAN_NAMING = 'boolean-naming';
export const RULE_ENUM_PATTERN = 'enum-pattern';
export const RULE_NO_SLICE_SELF_IMPORT = 'no-slice-self-import';
export const RULE_REQUIRE_SERVER_ONLY = 'require-server-only';
export const RULE_REQUIRE_CLIENT_ONLY = 'require-client-only';
export const RULE_NO_LEGACY_FOLDERS = 'no-legacy-folders';
export const RULE_NO_REDUNDANT_UNDEFINED = 'no-redundant-undefined';
export const RULE_JSX_BOOLEAN_VALUE = 'jsx-boolean-value';
export const RULE_JSX_FRAGMENTS = 'jsx-fragments';

/**
 * Combined plugin with all @37bytes rules
 * Use as: plugins: { '@37bytes': plugins }
 */
export const plugins = {
    rules: {
        ...noStoragePlugin.rules,
        ...noArrowPropsPlugin.rules,
        ...booleanNamingPlugin.rules,
        ...enumPatternPlugin.rules,
        ...noSliceSelfImportPlugin.rules,
        ...requireServerOnlyPlugin.rules,
        ...requireClientOnlyPlugin.rules,
        ...noLegacyFoldersPlugin.rules,
        ...noRedundantUndefinedPlugin.rules,
        ...jsxBooleanValuePlugin.rules,
        ...jsxFragmentsPlugin.rules
    }
};

export { default as booleanNamingPlugin } from '#plugins/boolean-naming';
export { default as enumPatternPlugin } from '#plugins/enum-pattern';
export { default as jsxBooleanValuePlugin } from '#plugins/jsx-boolean-value';
export { default as jsxFragmentsPlugin } from '#plugins/jsx-fragments';
export { default as noArrowPropsPlugin } from '#plugins/no-arrow-props';
export { default as noLegacyFoldersPlugin } from '#plugins/no-legacy-folders';
export { default as noRedundantUndefinedPlugin } from '#plugins/no-redundant-undefined';
export { default as noSliceSelfImportPlugin } from '#plugins/no-slice-self-import';
// Individual plugin exports for granular usage
export { default as noStoragePlugin } from '#plugins/no-storage';
export { default as requireClientOnlyPlugin } from '#plugins/require-client-only';
export { default as requireServerOnlyPlugin } from '#plugins/require-server-only';
