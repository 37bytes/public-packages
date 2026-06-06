import { readFileSync } from 'node:fs'; // correct — node protocol; no prefer-node-protocol violation

// parity: @typescript-eslint/no-unused-expressions disabled by oxlint bridge with no oxlint TS equivalent
// OxLint typescriptDisables: no-unused-expressions=off for TS files.
// eslint-plugin-oxlint bridge also turns it off.
// No typescript/no-unused-expressions in OxLint exists.
// In OxLint hybrid: tagged template expressions in TS have ZERO enforcement.
const sql = (strings: TemplateStringsArray) => strings.raw[0];
sql`SELECT * FROM users`; // parity: @typescript-eslint/no-unused-expressions — ESLint=error; OxLint=no coverage (TS override disables, no replacement)

// parity: Three unicorn rules covered by Biome but NOT disabled in biome/eslint-overrides.js (double-fire)
// 1. prefer-string-trim-start-end → Biome useTrimStartEnd (style)
// 2. throw-new-error → Biome useThrowNewError (style)
// 3. prefer-global-this → Biome useGlobalThis (nursery)
// eslint-plugin-oxlint bridge (eslint-config-biome 2.1.3) has no entries for these 3 unicorn rules.
// biome/eslint-overrides.js does NOT turn them off manually.
// Both ESLint warn AND Biome warn fire simultaneously in hybrid.

const str = '  hello  ';
str.trimLeft(); // parity: prefer-string-trim-start-end / useTrimStartEnd — ESLint=warn AND Biome=warn in hybrid (double-fire)

function throwBadError() {
    throw Error('no new'); // parity: throw-new-error / useThrowNewError — ESLint=warn AND Biome=warn in hybrid (double-fire)
}

// parity: no-useless-return (infrastructure): biome/eslint-overrides.js:82 disables ESLint error; Biome nursery=warn
function withUselessReturn(value: string): void {
    console.log(value);
    return; // parity: no-useless-return — ESLint disabled in hybrid (biome/eslint-overrides.js:82); Biome nursery=warn replaces error
}

// parity: unicorn/prefer-single-call absent from OxLint and Biome (unported, not documented as engine limitation)
// ESLint browser.js:32: unicorn/prefer-single-call=warn
// OxLint: rule absent (not in configuration_schema.json)
// Biome: no equivalent
const el = document.querySelectorAll('.item')[0]; // single call preferred over querySelector — parity: prefer-single-call — ESLint=warn; OxLint/Biome=absent

export { readFileSync, throwBadError, withUselessReturn, el };
