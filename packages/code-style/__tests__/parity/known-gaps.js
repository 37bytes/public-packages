/**
 * @fileoverview Documented parity coverage gaps. Every entry MUST have a reason
 * with a verification date and tool versions. An entry here silences the
 * corresponding Layer-1 forward-check failure. Keep this list SHORT — if it
 * grows past ~30 entries, stop and re-evaluate Layer 1 boundaries with the user.
 *
 * Optional `tools: ['biome'|'oxlint', ...]` array scopes the gap to the named tools;
 * an entry without `tools` applies to both tools.
 */
export const knownGaps = {
    'security/detect-non-literal-fs-filename': {
        reason: 'no equivalent in biome or oxlint (checked 2026-06-07, biome 2.4.13 / oxlint 1.61.0)'
    },
    'security/detect-unsafe-regex': {
        reason: 'no equivalent in biome or oxlint (checked 2026-06-07, biome 2.4.13 / oxlint 1.61.0)'
    },
    'import-x/no-self-import': {
        tools: ['biome'],
        reason: 'no biome equivalent; also not fixture-expressible (self-import breaks resolution before linting). Checked 2026-06-07. Oxlint covers it natively (import/no-self-import), so the gap is biome-only.'
    },
    'import-x/no-useless-path-segments': {
        reason: 'absent from oxlint 1.61.0 and biome 2.4.13; audit finding (imports domain). Re-check after oxlint 1.68 bump.'
    },
    'import-x/first': {
        tools: ['biome'],
        reason: 'import-x/first has no biome equivalent (checked 2026-06-07, biome 2.4.13); biome has no rule checking that imports appear first.'
    },
    'prefer-arrow-functions/prefer-arrow-functions': {
        reason: 'eslint-plugin-prefer-arrow-functions has no oxlint or biome equivalent (checked 2026-06-07).'
    },
    'sonarjs/no-redundant-jump': {
        tools: ['biome'],
        reason: 'sonarjs/no-redundant-jump has no biome equivalent (checked 2026-06-07, biome 2.4.13).'
    },
    '@typescript-eslint/no-array-constructor': {
        tools: ['biome'],
        reason: 'biome has no noArrayConstructor rule as of 2.4.13 (checked 2026-06-07). Task C adds equivalent via biome config. Remove this entry after Task C lands.'
    },
    // Tool-only biome rules (no eslint counterpart, keyed by biome rule name for reverseGapApplies):
    'suspicious/noExportsInTest': {
        tools: ['biome'],
        reason: 'biome suspicious/noExportsInTest (jest/no-export inspired) has no @vitest/eslint-plugin equivalent; @vitest/eslint-plugin 1.6.17 has no no-export-in-test rule. Biome-only enforcement. Checked 2026-06-07.'
    },
    'suspicious/noDuplicateTestHooks': {
        tools: ['biome'],
        reason: 'biome suspicious/noDuplicateTestHooks (jest/no-duplicate-hooks inspired) has no @vitest/eslint-plugin equivalent (checked 2026-06-07). Biome-only enforcement.'
    }
    // The red-baseline run (Task 7) will surface the remaining genuine engine gaps.
    // Add them HERE with reasons only when they are confirmed engine limitations,
    // NOT when they are our config drift — drift gets fixed in the next plan instead.
};
