// parity: no-throw-literal — severity divergence in plain JS files
// ESLint no-throw-literal=warn (eslint/rules/javascript.js:144)
// OxLint no-throw-literal=warn (oxlint/rules/javascript.js:77)
// Biome useThrowOnlyError=error (biome/rules/javascript.js:47, biome/config.json:79)
// biome/eslint-overrides.js:33 disables ESLint no-throw-literal — Biome error replaces ESLint warn

function processRequest(value) {
    if (!value) {
        throw 'missing value'; // parity: no-throw-literal — ESLint/OxLint=warn; Biome=error (severity mismatch)
    }
    return value;
}

// parity: Biome enforces noCommonJs (bans require/module.exports) with no ESLint counterpart
// ESLint: no import-x/no-commonjs rule for .js files; only no-amd
// Biome: noCommonJs=error (biome/rules/imports.js:13, biome/config.json:131)
// OxLint: no equivalent rule
const config = require('./config'); // parity: noCommonJs — Biome=error; ESLint/OxLint=absent

module.exports = { processRequest, config }; // parity: noCommonJs (module.exports) — Biome=error; ESLint/OxLint=absent
