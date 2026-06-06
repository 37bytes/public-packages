/**
 * @fileoverview Правила для Next.js (@next/eslint-plugin-next)
 * @author 37bytes
 *
 * App Router only — Pages Router правила не включены.
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Must be followed, no exceptions
 */

/**
 * Правила для Next.js (13 правил).
 *
 * Входит в `nextjsConfig`.
 * Покрывает: components, scripts, fonts, navigation, performance.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const nextjs = {
    // === Components ===
    '@next/next/no-async-client-component': 'error', // async Client Component — runtime error
    '@next/next/no-head-element': 'error', // использовать metadata API, не сырой <head>
    '@next/next/no-assign-module-variable': 'error', // module = ... ломает HMR
    '@next/next/no-document-import-in-page': 'error', // biome: suspicious/noDocumentImportInPage
    '@next/next/no-head-import-in-document': 'error', // biome: suspicious/noHeadImportInDocument

    // === Scripts ===
    '@next/next/inline-script-id': 'error', // id обязателен для inline Script (дедупликация)
    '@next/next/no-sync-scripts': 'warn', // синхронные скрипты блокируют рендеринг
    '@next/next/next-script-for-ga': 'warn', // @next/third-parties для GA/GTM

    // === Fonts ===
    '@next/next/google-font-display': 'warn', // font-display для Google Fonts
    '@next/next/google-font-preconnect': 'warn', // preconnect для Google Fonts
    '@next/next/no-page-custom-font': 'warn', // шрифты глобально через next/font

    // === Navigation ===
    '@next/next/no-html-link-for-pages': 'warn', // next/link вместо <a> для внутренних страниц

    // === Performance ===
    '@next/next/no-img-element': 'warn', // next/image вместо <img>
    '@next/next/no-css-tags': 'warn', // CSS через import, не через <link>
    '@next/next/no-unwanted-polyfillio': 'warn' // не дублировать встроенные полифилы
};
