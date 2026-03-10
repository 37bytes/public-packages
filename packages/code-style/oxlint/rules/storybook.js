/**
 * @fileoverview Storybook override rules for OxLint
 *
 * Goes into overrides[2] for *.stories.* files.
 * Maps to eslint/rules/storybook.js.
 * Loaded via jsPlugins (eslint-plugin-storybook).
 */

export const storybook = {
    'import/no-default-export': 'off',
    'storybook/await-interactions': 'error',
    'storybook/context-in-play-function': 'error',
    'storybook/use-storybook-expect': 'warn',
    'storybook/use-storybook-testing-library': 'warn',
    'storybook/csf-component': 'warn',
    'storybook/default-exports': 'error',
    'storybook/meta-inline-properties': 'error',
    'storybook/meta-satisfies-type': 'warn',
    'storybook/no-uninstalled-addons': 'error',
    'storybook/hierarchy-separator': 'error',
    'storybook/no-stories-of': 'error',
    'storybook/story-exports': 'error',
    'storybook/no-redundant-story-name': 'warn',
    'storybook/prefer-pascal-case': 'warn'
};
