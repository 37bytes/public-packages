import { describe, test, expect } from 'vitest';

// parity: no-floating-promises: ESLint turns it off in tests; Biome keeps it enforced
// ESLint testOverrides (testing.js:83): @typescript-eslint/no-floating-promises=off
// Biome test domain: noFloatingPromises still active (not relaxed)
// OxLint testOverrides (oxlint/rules/testing.js:17): typescript/no-floating-promises=off

async function fetchData(): Promise<string> {
    return 'data';
}

describe('node service', () => {
    test('async without await', () => {
        fetchData(); // parity: no-floating-promises — ESLint=off in tests; Biome=error; OxLint=off
        expect(true).toBe(true);
    });
});

// parity: OxLint does not turn off sonarjs/cognitive-complexity in test files
// oxlint/rules/testing.js has no sonarjs/cognitive-complexity: off override
// A function here exceeding complexity 15 would pass ESLint/Biome (both relax it) but hit OxLint warn
function complexTestHelper(a: number, b: number, c: number): string {
    // complexity is kept low here; the ABSENCE of the override is the finding, not this function's complexity
    return `${a}-${b}-${c}`; // parity: sonarjs/cognitive-complexity — ESLint/Biome=off in tests; OxLint=warn (not turned off)
}

export { complexTestHelper };
