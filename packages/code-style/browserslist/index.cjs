/**
 * @fileoverview Browserslist preset for 37bytes projects
 * @author 37bytes
 *
 * Usage in package.json:
 *   "browserslist": ["extends @37bytes/code-style/browserslist"]
 *
 * Or in .browserslistrc:
 *   extends @37bytes/code-style/browserslist
 *
 * Firefox ESR pin (128) should be updated when the ESR cycle rotates.
 * Run `npx update-browserslist-db@latest` periodically to keep caniuse-lite fresh.
 */

module.exports = [
    // Desktop
    'last 2 Chrome versions',
    'last 2 Edge versions',
    'last 2 Opera versions',
    'last 2 Firefox versions',
    'Firefox ESR',
    'Firefox 128',
    'last 3 Safari major versions',

    // Mobile
    'last 3 ChromeAndroid versions',
    'last 3 iOS major versions',
    'last 2 Samsung versions',
    'last 1 op_mob version'
];
