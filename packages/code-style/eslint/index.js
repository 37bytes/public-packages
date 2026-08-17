/**
 * @fileoverview ESLint configuration exports - index file only for exports
 * @author 37bytes
 */

import { browser } from '#rules/browser';
import { imports } from '#rules/imports';
// Re-export all rules (individual)
// Grouped rules export for convenience: import { rules } from '@37bytes/configs/eslint'
import { javascript } from '#rules/javascript';
import { nextjs as nextjsRules } from '#rules/nextjs';
import { node, nodeCjs, nodeStrict } from '#rules/node';
import { perfectionistReact, perfectionist as perfectionistRules } from '#rules/perfectionist';
import { quality } from '#rules/quality';
import { react } from '#rules/react';
import { reactCompiler } from '#rules/react-compiler';
import { regexp } from '#rules/regexp';
import { storybook } from '#rules/storybook';
import { testing, testingReact } from '#rules/testing';
import { typescript } from '#rules/typescript';

// Re-export configurations — new structure
export {
    browserLibrary,
    library,
    nextjs,
    nextjsConfig,
    nextjsServerConfig,
    nodeCjsConfig,
    nodeConfig,
    nodejsConfig,
    nodejsRuntime,
    nodejsTool,
    // Perfectionist
    perfectionist,
    perfectionistBaseConfig,
    perfectionistReactConfig,
    reactCompilerConfig,
    reactConfig,
    reactLibrary,
    // Main configs
    spa,
    storybookConfig,
    storybookMainConfig,
    // Opt-in
    testingConfig,
    testingReactConfig,
    // Layers
    typescriptConfig
} from '#config';
// Re-export browser features compatibility config
export { browserFeaturesConfig } from '#eslint/browser-features';
// Re-export FSD config
export { createFSDConfig } from '#eslint/fsd';
// Re-export restricted imports config
export { createRestrictedImportsConfig } from '#eslint/restricted-imports';
// Re-export plugins
export {
    plugins,
    RULE_BOOLEAN_NAMING,
    RULE_ENUM_PATTERN,
    RULE_NO_ARROW_PROPS,
    RULE_NO_LEGACY_FOLDERS,
    RULE_NO_SLICE_SELF_IMPORT,
    RULE_NO_STORAGE,
    RULE_REQUIRE_CLIENT_ONLY,
    RULE_REQUIRE_SERVER_ONLY
} from '#plugins';
export {
    booleanNamingPlugin,
    enumPatternPlugin,
    noArrowPropsPlugin,
    noLegacyFoldersPlugin,
    noSliceSelfImportPlugin,
    noStoragePlugin,
    requireClientOnlyPlugin,
    requireServerOnlyPlugin
} from '#plugins';
export { browser } from '#rules/browser';
export { imports } from '#rules/imports';
export { javascript } from '#rules/javascript';
export { nextjs as nextjsRules } from '#rules/nextjs';
export { node, nodeCjs, nodeStrict } from '#rules/node';
export { perfectionistReact, perfectionist as perfectionistRules, withServerBoundaryFirst } from '#rules/perfectionist';
export { quality } from '#rules/quality';

export { react } from '#rules/react';

export { reactCompiler } from '#rules/react-compiler';

export { regexp } from '#rules/regexp';

export { storybook } from '#rules/storybook';

export { testing, testingLibraryRules, testingReact, testOverrides, vitestRules } from '#rules/testing';

export { typescript } from '#rules/typescript';

export const rules = {
    javascript,
    typescript,
    browser,
    react,
    reactCompiler,
    imports,
    testing,
    testingReact,
    node,
    nodeCjs,
    nodeStrict,
    quality,
    regexp,
    storybook,
    nextjs: nextjsRules,
    perfectionist: perfectionistRules,
    perfectionistReact
};
