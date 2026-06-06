import { describe, test, expect } from 'vitest';

// parity: Biome enforces noExportsInTest and noDuplicateTestHooks; ESLint and OxLint have no equivalent
// Biome biome/config.json:232-233: noExportsInTest=error, noDuplicateTestHooks=warn
// ESLint and OxLint have no equivalent rules configured

export const utilFromTest = () => 'helper'; // parity: noExportsInTest — Biome=error; ESLint/OxLint=absent

describe('tool utilities', () => {
    afterEach(() => {
        /* cleanup */
    });
    afterEach(() => {
        /* duplicate */
    }); // parity: noDuplicateTestHooks — Biome=warn; ESLint/OxLint=absent

    test('basic assertion', () => {
        expect(utilFromTest()).toBe('helper');
    });
});

// parity: Biome hybrid mode double-enforces vitest/no-focused-tests and vitest/no-disabled-tests
// biome/eslint-overrides.js does NOT disable vitest/no-focused-tests or vitest/no-disabled-tests
// Biome noFocusedTests=error, noSkippedTests=warn also fire.
// Both linter layers report the same violation.
test.skip('forgotten skip', () => {
    // parity: no-disabled-tests/noSkippedTests — double-fires in hybrid
    expect(1).toBe(1);
});
