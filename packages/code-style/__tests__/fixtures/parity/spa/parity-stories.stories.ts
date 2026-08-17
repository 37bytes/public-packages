// parity: import/no-anonymous-default-export stays error in OxLint for story files
// ESLint storybookConfig (eslint/config.js:449) turns off import-x/no-anonymous-default-export.
// OxLint storybook override (oxlint/config.json:483-500) only turns off import/no-default-export.
// OxLint import/no-anonymous-default-export remains error. CSF pattern triggers it.

// Standard CSF pattern: anonymous object default export
// ESLint: silent (storybookConfig turns off no-anonymous-default-export)
// OxLint: ERROR (import/no-anonymous-default-export still fires)
export default {
    // parity: import/no-anonymous-default-export — OxLint=error; ESLint=off for stories
    title: 'Button',
    component: () => null
};

export const Primary = {};
