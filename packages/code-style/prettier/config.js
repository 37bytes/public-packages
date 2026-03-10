/**
 * @fileoverview Prettier configuration
 * @author 37bytes
 *
 * Formatting settings for code consistency.
 * Aligned with EditorConfig settings.
 */

/**
 * Prettier configuration for @37bytes projects
 * @type {import('prettier').Config}
 */
export const config = {
    // Line length
    printWidth: 120,

    // Indentation
    tabWidth: 4,
    useTabs: false,

    // Semicolons
    semi: true,

    // Quotes
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,

    // Trailing commas
    trailingComma: 'none',

    // Brackets and spacing
    bracketSpacing: true,
    bracketSameLine: false,

    // Arrow functions
    arrowParens: 'always',

    // HTML
    htmlWhitespaceSensitivity: 'strict',

    // Line endings
    endOfLine: 'lf',

    // Prose (markdown)
    proseWrap: 'never',

    // Embedded languages
    embeddedLanguageFormatting: 'auto'
};

export default config;
