import { describe, test, expect } from 'vitest';

// parity: Biome hybrid mode double-enforces vitest/no-focused-tests and vitest/no-disabled-tests
// biome/rules/testing.js:15-16: noFocusedTests=error, noSkippedTests=warn
// eslint/rules/testing.js:27-28: vitest/no-focused-tests=error, vitest/no-disabled-tests=warn
// biome/eslint-overrides.js does NOT disable either vitest rule — both fire in hybrid
describe.skip('skipped suite', () => {
    // parity: no-disabled-tests / noSkippedTests — BOTH fire in hybrid (double-fire)
    test.only('focused test', () => {
        // parity: no-focused-tests / noFocusedTests — BOTH fire in hybrid (double-fire)
        expect(true).toBe(true);
    });
});

// parity: Biome enforces noExportsInTest and noDuplicateTestHooks; ESLint and OxLint have no equivalent
export const helperFromTest = 'exported'; // parity: noExportsInTest — Biome=error; ESLint/OxLint=absent

describe('hooks', () => {
    beforeEach(() => {}); // parity: noDuplicateTestHooks — Biome=warn on duplicate; ESLint/OxLint=absent
    beforeEach(() => {}); // second beforeEach triggers noDuplicateTestHooks

    test('something', () => {
        expect(1).toBe(1);
    });
});

// parity: no-floating-promises: ESLint turns it off in tests; Biome keeps it enforced
// eslint/rules/testing.js:83: @typescript-eslint/no-floating-promises=off in test override
// biome/rules/testing.js has no equivalent relaxation for no-floating-promises
// biome/config.json:197: noFloatingPromises still active in test domain
async function fetchData(): Promise<void> {}
fetchData(); // parity: no-floating-promises — ESLint=off in tests; Biome=error (not relaxed in test override)

// parity: OxLint does not turn off sonarjs/cognitive-complexity in test files
// ESLint testOverrides: complexity=off (eslint/rules/testing.js:80)
// Biome: noExcessiveCognitiveComplexity disabled in test files (biome/config.json:236-238)
// OxLint: sonarjs/cognitive-complexity NOT turned off in oxlint/rules/testing.js
// A function exceeding complexity 15 here would be flagged by OxLint but not ESLint/Biome
