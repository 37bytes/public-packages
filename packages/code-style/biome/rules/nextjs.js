/**
 * Next.js rules: @next/eslint-plugin-next → Biome categories
 *
 * Biome has native Next.js support via the 'next' domain.
 * Rules auto-activate when next is in consumer's package.json.
 *
 * Source: eslint/rules/nextjs.js
 */

export const nextjs = {
    suspicious: {
        useGoogleFontDisplay: 'warn', // @next/next/google-font-display
        noDocumentImportInPage: 'error', // @next/next/no-document-import-in-page
        noHeadImportInDocument: 'error' // @next/next/no-head-import-in-document
    },
    style: {
        noHeadElement: 'error' // @next/next/no-head-element
    },
    performance: {
        noImgElement: 'warn', // @next/next/no-img-element
        useGoogleFontPreconnect: 'warn', // @next/next/google-font-preconnect
        noUnwantedPolyfillio: 'warn', // @next/next/no-unwanted-polyfillio
        noSyncScripts: 'warn' // @next/next/no-sync-scripts
    },
    correctness: {
        noNextAsyncClientComponent: 'error', // @next/next/no-async-client-component
        useInlineScriptId: 'error', // @next/next/inline-script-id
        noBeforeInteractiveScriptOutsideDocument: 'warn' // @next/next/no-before-interactive-script-outside-document
    }
};

/**
 * ESLint Next.js rules with NO Biome equivalent:
 *
 * — @next/next/no-css-tags
 * — @next/next/no-page-custom-font
 * — @next/next/no-assign-module-variable
 * — @next/next/next-script-for-ga
 * — @next/next/no-html-link-for-pages
 */
