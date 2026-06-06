// parity: prefer-node-protocol severity mismatch across all three linters
// ESLint n/prefer-node-protocol=error (node.js:43)
// Biome useNodejsImportProtocol=warn (biome/rules/javascript.js:48)
// OxLint unicorn/prefer-node-protocol=warn (browser.js:22)
import fs from 'fs'; // parity: prefer-node-protocol — ESLint=error; Biome/OxLint=warn (severity mismatch)
import path from 'path'; // parity: prefer-node-protocol — same mismatch

// parity: no-throw-literal — Biome=error for all files; ESLint/OxLint=warn for non-TS JS files
// In TS files: @typescript-eslint/only-throw-error=error takes over; base no-throw-literal=off
// In JS files (e.g. bootstrap scripts): ESLint no-throw-literal=warn; Biome useThrowOnlyError=error
// This TS file exercises the TS path; the JS divergence file is below.
function throwString() {
    throw 'raw string error'; // parity: only-throw-error/useThrowOnlyError — both=error in TS; shape mismatch for allowThrowingUnknown
}

// parity: @typescript-eslint/only-throw-error not disabled in Biome hybrid ESLint override
// ESLint: allowThrowingUnknown=true — throwing unknown variable is OK
// Biome: useThrowOnlyError has no equivalent ignoreUnknown option
// biome/eslint-overrides.js:33 does NOT disable @typescript-eslint/only-throw-error
// Both fire in hybrid. Biome may flag code that ESLint accepts.
function reThrow(error: unknown) {
    throw error; // parity: only-throw-error allowThrowingUnknown — ESLint=ok; Biome=error (no equiv option)
}

export { throwString, reThrow };
export { fs, path };
