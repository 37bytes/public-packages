/**
 * @fileoverview Правила для Storybook stories (eslint-plugin-storybook)
 * @author 37bytes
 *
 * Применяется только к файлам *.stories.*.
 * Storybook 10, CSF 3.
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Must be followed, no exceptions
 */

/**
 * Правила для Storybook (14 правил).
 *
 * Входит в `storybookConfig`.
 * Покрывает: interactions, meta, CSF, naming.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const storybook = {
    // === Interactions ===
    'storybook/await-interactions': 'error', // await в play функциях
    'storybook/context-in-play-function': 'error', // передавать context при вызове play другой story
    'storybook/use-storybook-expect': 'warn', // expect из storybook/test
    'storybook/use-storybook-testing-library': 'warn', // testing utils из storybook/test

    // === Meta ===
    'storybook/csf-component': 'warn', // component в meta
    'storybook/default-exports': 'error', // default export обязателен
    'storybook/meta-inline-properties': 'error', // свойства meta только inline
    'storybook/meta-satisfies-type': 'warn', // satisfies Meta<typeof Component>
    'storybook/no-uninstalled-addons': 'error', // аддоны из конфига должны быть установлены

    // === CSF ===
    'storybook/hierarchy-separator': 'error', // запрет deprecated | и . в title
    'storybook/no-stories-of': 'error', // запрет deprecated storiesOf()
    'storybook/story-exports': 'error', // хотя бы одна story в файле

    // === Naming ===
    'storybook/no-redundant-story-name': 'warn', // не дублировать name из export
    'storybook/prefer-pascal-case': 'warn' // PascalCase для stories
};
