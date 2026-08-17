'use client';

// parity: Five ESLint rules missing from Biome with no compensating ESLint disable
// These rules fire in ESLint but have no Biome equivalent. In biome hybrid, ESLint stays active.
// But for Biome-only consumers, these 5 rules have zero coverage.

// 1. @next/next/no-assign-module-variable (error in ESLint, no Biome equivalent)
// Cannot be expressed without actually assigning to 'module' — causes TS error; see layer-1 note

// 2. @next/next/next-script-for-ga (warn in ESLint, no Biome equivalent)
// eslint fires when <script> is used for GA instead of <Script> component
const PageWithScript = () => (
    <head>
        {/* parity: next-script-for-ga — ESLint=warn (fires on raw <script> for analytics); Biome=absent */}
        <script src="https://www.googletagmanager.com/gtag/js" />
    </head>
);

// 3. @next/next/no-page-custom-font (warn in ESLint, no Biome equivalent)
const PageWithFont = () => (
    <head>
        {/* parity: no-page-custom-font — ESLint=warn (custom font link in page); Biome=absent */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
    </head>
);

// 4. @next/next/no-html-link-for-pages (warn in ESLint, no Biome equivalent)
const NavWithHtmlLink = () => (
    <nav>
        {/* parity: no-html-link-for-pages — ESLint=warn (raw <a> for Next.js page); Biome=absent */}
        <a href="/about">About</a>
    </nav>
);

// 5. @next/next/no-css-tags (warn in ESLint, no Biome equivalent)
const PageWithCss = () => (
    <head>
        {/* parity: no-css-tags — ESLint=warn (raw <link> CSS tag); Biome=absent */}
        <link rel="stylesheet" href="/styles/main.css" />
    </head>
);

export { PageWithScript, PageWithFont, NavWithHtmlLink, PageWithCss };
