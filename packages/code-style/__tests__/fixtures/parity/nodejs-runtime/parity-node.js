/* eslint-disable no-undef */
// parity: CJS globals (require, module) trigger ESLint no-undef in ESM-configured context.
// ESLint no-undef cannot distinguish CJS vs ESM at parse time without env:commonjs.
// Suppressed here with file-level disable so the fixture tests CJS parity (noCommonJs) cleanly.

// parity: Biome enforces noCommonJs (bans require/module.exports) with no ESLint counterpart
// ESLint: no import-x/no-commonjs rule for .js files; only no-amd
// Biome: noCommonJs=error (biome/rules/imports.js:13, biome/config.json:131)
// OxLint: no equivalent rule
const config = require('./config'); // parity: noCommonJs — Biome=error; ESLint/OxLint=absent

// parity: func-style: ESLint enforces expression style; Biome and OxLint have no equivalent
// Function declaration below triggers ESLint func-style=warn; Biome/OxLint are silent.
function processRequest(value) {
    // parity: func-style — ESLint=warn; Biome/OxLint=absent
    if (!value) {
        throw new Error('missing value'); // correct form: Error with new
    }
    return value;
}

module.exports = { processRequest, config }; // parity: noCommonJs (module.exports) — Biome=error; ESLint/OxLint=absent
