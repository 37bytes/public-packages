/**
 * @fileoverview Стилистические правила JSX
 * @author 37bytes
 *
 * Три правила, которые исторически жили в `eslint-plugin-react`,
 * но при миграции на `@eslint-react/eslint-plugin` отпали:
 *
 *   1. `@stylistic/jsx-curly-brace-presence` — взято из umbrella @stylistic/eslint-plugin
 *      (Stylistic team портировала это правило идеально).
 *   2. `@37bytes/jsx-boolean-value` — наш локальный плагин (Stylistic не портировал).
 *   3. `@37bytes/jsx-fragments` — наш локальный плагин (Stylistic не портировал).
 *
 * Все three имеют автофикс. Severity warn (стилистика, не корректность).
 */

/**
 * @type {import('eslint').Linter.RulesRecord}
 */
export const reactStylistic = {
    '@stylistic/jsx-curly-brace-presence': ['warn', 'never'],
    '@37bytes/jsx-boolean-value': 'warn',
    '@37bytes/jsx-fragments': 'warn'
};
