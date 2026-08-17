// parity: @typescript-eslint/no-unused-expressions disabled by oxlint bridge with no oxlint TS equivalent
// oxlint/rules/typescript.js:17 disables no-unused-expressions in TS files (typescriptDisables)
// eslint-plugin-oxlint bridge also disables the ESLint rule.
// No typescript/no-unused-expressions in OxLint exists.
// Result: tagged template expressions in TS files have ZERO lint coverage in OxLint hybrid.
const ts_tag = (strings: TemplateStringsArray) => strings.raw[0];
ts_tag`this expression result is unused`; // parity: @typescript-eslint/no-unused-expressions — ESLint=error; OxLint=no coverage (disabled with no TS replacement)

// parity: Enum member naming convention conflict: ESLint requires UPPER_CASE, Biome allows PascalCase
// ESLint: enumMember format=['UPPER_CASE'] only (typescript.js:199)
// Biome: enumMember formats=['PascalCase', 'CONSTANT_CASE'] — PascalCase accepted
// biome/eslint-overrides.js:43 disables @typescript-eslint/naming-convention in hybrid
enum Direction {
    North = 'north', // UPPER_CASE: valid for ESLint AND Biome
    South = 'south', // UPPER_CASE: valid for ESLint AND Biome
    PascalCaseMember = 'east' // parity: enumMember naming — ESLint=error (not UPPER_CASE); Biome=warn (PascalCase allowed)
}

// parity: @typescript-eslint/only-throw-error not disabled in Biome hybrid ESLint override
// ESLint: only-throw-error with allowThrowingUnknown=true (so throw unknownVar is ok)
// Biome: useThrowOnlyError with different option model (no allowThrowingUnknown)
// biome/eslint-overrides.js does NOT disable @typescript-eslint/only-throw-error — both fire in hybrid
function riskyThrow(value: unknown) {
    throw value; // parity: only-throw-error — ESLint=ok (allowThrowingUnknown=true); Biome=error (useThrowOnlyError, no equiv option) — both active in hybrid
}

// parity: no-loop-func disabled in oxlint TS override but no typescript/ equivalent added
// oxlint/rules/typescript.js:21 disables no-loop-func in TS files.
// No typescript/no-loop-func OxLint rule exists. Gap: no-loop-func has zero coverage in OxLint for TS.
// parity: @typescript-eslint/array-type — all three fire on Array<string>; Array<() => number> is complex type
// biome useConsistentArrayType only fires on simple types; ESLint/OxLint fire on complex too.
const simpleArr: Array<string> = []; // parity: array-type — ESLint=warn; Biome=warn; OxLint=warn (all agree)
const funcs: Array<() => number> = [];
for (let i = 0; i < 3; i++) {
    funcs.push(() => i); // parity: no-loop-func — ESLint=warn (@typescript-eslint/no-loop-func); OxLint=no coverage
}

// parity: Biome naming-convention covers far fewer selectors than ESLint (I-prefix ban)
// ESLint naming-convention: interface must NOT start with 'I' (custom regex '^I[A-Z]' match:false)
// Biome useNamingConvention: only 5 selectors, no I-prefix ban on interface
interface IUserData {
    // parity: naming-convention I-prefix — ESLint=error; Biome=silent (no interface selector)
    name: string;
}

// parity: prefer-node-protocol is in ESLint ONLY for nodejs presets (n/prefer-node-protocol = error).
// For spa preset, ESLint has no equivalent; Biome useNodejsImportProtocol = warn; OxLint unicorn/prefer-node-protocol = warn.
// The severity mismatch test lives in parity-node.ts (nodejs-runtime preset).
// Import uses the correct 'node:path' protocol here to avoid spurious tool-only firing in spa context.
import path from 'node:path'; // correct protocol; biome/oxlint do NOT fire (no violation)

export { Direction, riskyThrow, funcs, simpleArr, path };
export type { IUserData };
