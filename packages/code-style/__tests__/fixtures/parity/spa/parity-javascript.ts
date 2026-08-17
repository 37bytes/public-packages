// parity: no-self-compare severity: error in ESLint/OxLint, warn in Biome
// In HYBRID setup: no-self-compare is NOT in biome/eslint-overrides.js, so ESLint error stays active.
// For Biome-only consumers: biome noSelfCompare=warn, not error.
const value = 42;
if (value === value) console.log('nan check?'); // parity: no-self-compare — ESLint/OxLint=error; Biome=warn

// parity: eqeqeq smart-mode has no Biome equivalent — null checks will be flagged
// ESLint/OxLint: eqeqeq 'smart' — allows x == null
// Biome: noDoubleEquals plain warn — flags x == null (ignoreNull option not set)
function isNullish(x: unknown) {
    return x == null; // parity: eqeqeq — ESLint/OxLint allow (smart mode); Biome warns (no ignoreNull)
}

// parity: no-unused-expressions option mismatch: allowTaggedTemplates missing in OxLint
const tag = (strings: TemplateStringsArray) => strings.raw[0];
tag`hello`; // parity: no-unused-expressions — ESLint allows (allowTaggedTemplates:true); OxLint errors (option absent)

// parity: unicorn/prefer-number-properties in OxLint but absent from ESLint
const bad = isNaN(value); // parity: unicorn/prefer-number-properties — OxLint=warn; ESLint=absent

// parity: unicorn/custom-error-definition enforced in ESLint (error) but absent from OxLint and Biome
class BadError extends Error {
    // parity: unicorn/custom-error-definition — ESLint=error; OxLint/Biome=absent
    name = 'BadError';
}

export { isNullish, bad, BadError };
