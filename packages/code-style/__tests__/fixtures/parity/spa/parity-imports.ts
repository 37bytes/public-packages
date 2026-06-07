// parity: import/no-anonymous-default-export stays error in OxLint for story files
// NOTE: this is the *base* rule — in *.stories.* files ESLint turns it off but OxLint does not.
// The fixture that exercises the DIVERGENCE must be named *.stories.ts (see parity-stories.stories.ts)

// parity: import-x/no-extraneous-dependencies devDependencies allowlist not reflected in Biome
// Biome noUndeclaredDependencies has no glob restriction — devDeps allowed everywhere in Biome.
// ESLint restricts devDeps to __tests__/**  and *.stories.tsx only.
// A production-code file importing a devDep triggers ESLint/not-Biome:
import { describe } from 'vitest'; // parity: import-x/no-extraneous-dependencies (devDep in prod file — ESLint error, Biome passes)

// parity: Biome enforces noCommonJs (bans require/module.exports) with no ESLint counterpart
const something = require('node:path'); // parity: noCommonJs — Biome error, ESLint silent

// parity: import-x/no-self-import absent from Biome with no coverage fallback
// (Self-import is not expressible in a real file that would parse cleanly; annotate as layer-1 complement)
// import './parity-imports'; // would cause circular resolution at lint time

// parity: no-useless-return severity: error in ESLint/OxLint, warn in Biome nursery
// biome/eslint-overrides.js:82 disables ESLint no-useless-return — Biome nursery=warn replaces error
// The trailing return; in a void function is truly useless (not unreachable like after `return value;`).
// All three tools fire on this pattern; the severity divergence is the parity finding.
function logValue(value: string): void {
    if (!value) return;
    console.log(value);
    return; // parity: no-useless-return — ESLint/OxLint=error; Biome nursery=warn (downgraded)
}

export { something, logValue, describe };
