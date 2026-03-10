/**
 * @fileoverview Next.js App Router rules for OxLint
 *
 * Maps to eslint/rules/nextjs.js.
 * Note: OxLint uses 'nextjs/' prefix (ESLint uses '@next/next/').
 */

export const nextjs = {
    'nextjs/no-async-client-component': 'error',
    'nextjs/no-head-element': 'error',
    'nextjs/no-assign-module-variable': 'error',
    'nextjs/inline-script-id': 'error',
    'nextjs/no-sync-scripts': 'warn',
    'nextjs/next-script-for-ga': 'warn',
    'nextjs/google-font-display': 'warn',
    'nextjs/google-font-preconnect': 'warn',
    'nextjs/no-page-custom-font': 'warn',
    'nextjs/no-html-link-for-pages': 'warn',
    'nextjs/no-img-element': 'warn',
    'nextjs/no-css-tags': 'warn',
    'nextjs/no-unwanted-polyfillio': 'warn'
};
