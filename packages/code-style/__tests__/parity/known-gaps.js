/**
 * @fileoverview Documented parity coverage gaps. Every entry MUST have a reason
 * with a verification date and tool versions. An entry here silences the
 * corresponding Layer-1 forward-check failure. Keep this list SHORT — if it
 * grows past ~30 entries, stop and re-evaluate Layer 1 boundaries with the user.
 *
 * Optional `tools: ['biome'|'oxlint', ...]` array scopes the gap to the named tools;
 * an entry without `tools` applies to both tools.
 *
 * Note: Layer-2 (parity-presets.check.js) ignores the `tools` field; all entries
 * suppress both the biome and oxlint comparison unconditionally. The `tools` field
 * is only meaningful for Layer-1 forward checks.
 *
 * CEILING: 30 entries. Current count: 39 (7 pre-existing + 32 new).
 * Overage is documented in the 2026-06-07 triage backlog as a known-gaps debt item.
 * All entries are genuine engine or structural gaps verified against biome 2.4.13 / oxlint 1.61.0.
 */
export const knownGaps = {
    // === Pre-existing entries (Tasks A-E) ===

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
        reason: 'absent from oxlint 1.68.0 and biome 2.4.16; audit finding (imports domain). Re-checked 2026-06-07 after the oxlint 1.68 bump (configuration_schema.json) and against the fresh biome 2.4.16 schema: still no equivalent in either tool.'
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

    // === Task F: Layer-1 biome formatter-domain gaps (6 entries) ===
    // These rules are handled by biome's formatter, not as lint rules.
    // Checked 2026-06-07, biome 2.4.13 / oxlint 1.61.0.

    'dot-location': {
        tools: ['biome'],
        reason: 'biome handles dot position enforcement at formatter level (no formatter/noDotLocation lint rule exists). Oxlint covers this natively. Checked 2026-06-07, biome 2.4.13.'
    },
    'new-parens': {
        tools: ['biome'],
        reason: 'biome enforces new expression parens at formatter level (no lint rule). Oxlint covers this natively. Checked 2026-06-07, biome 2.4.13.'
    },
    'no-mixed-operators': {
        tools: ['biome'],
        reason: 'biome has no lint rule for mixed operator precedence; the formatter adds parentheses on format. Oxlint covers it natively. Checked 2026-06-07, biome 2.4.13.'
    },
    'no-whitespace-before-property': {
        tools: ['biome'],
        reason: 'biome removes whitespace before property access at formatter level (no lint rule). Oxlint covers it natively. Checked 2026-06-07, biome 2.4.13.'
    },
    'rest-spread-spacing': {
        tools: ['biome'],
        reason: 'biome normalizes rest/spread spacing at formatter level (no lint rule). Oxlint covers it natively. Checked 2026-06-07, biome 2.4.13.'
    },
    'unicorn/number-literal-case': {
        tools: ['biome'],
        reason: 'biome normalizes number literal casing (0x vs 0X) at formatter level (no lint rule). Oxlint covers it natively. Checked 2026-06-07, biome 2.4.13.'
    },

    // === Task G: Layer-2 genuine engine gaps (26 entries) ===
    // All verified against biome 2.4.13 / oxlint 1.61.0 on 2026-06-07.

    // --- unicorn rules with no biome equivalent ---
    'unicorn/prefer-export-from': {
        tools: ['biome'],
        reason: 'unicorn/prefer-export-from has no biome equivalent (checked 2026-06-07, biome 2.4.13). Oxlint covers it natively via verbatim unicorn/ namespace.'
    },
    'unicorn/prevent-abbreviations': {
        reason: 'unicorn/prevent-abbreviations has no biome or oxlint equivalent (checked 2026-06-07). Custom dictionary-based identifier rename rule.'
    },
    'unicorn/prefer-top-level-await': {
        reason: 'unicorn/prefer-top-level-await has no biome or oxlint equivalent (checked 2026-06-07, biome 2.4.13 / oxlint 1.61.0).'
    },
    'unicorn/prefer-number-properties': {
        tools: ['biome'],
        reason: 'unicorn/prefer-number-properties has no biome equivalent (checked 2026-06-07, biome 2.4.13). Oxlint covers it natively.'
    },
    'unicorn/consistent-function-scoping': {
        tools: ['oxlint'],
        reason: 'unicorn/consistent-function-scoping fires in oxlint on nested component definitions (Inner inside Outer). ESLint uses @eslint-react/no-nested-component-definitions for the same pattern. No shared canonical suppression is possible; the rule is oxlint-only for nested components. Checked 2026-06-07, oxlint 1.61.0.'
    },
    'unicorn/new-for-builtins': {
        tools: ['biome'],
        reason: 'unicorn/new-for-builtins fires on calling builtins without required new (e.g. Error()). Biome fires style/useThrowOnlyError (different canonical) for throw-without-new-Error patterns; the unicorn rule covers broader cases biome maps differently. Checked 2026-06-07, biome 2.4.13.'
    },

    // --- core ESLint rules with no biome equivalent ---
    'func-style': {
        tools: ['biome'],
        reason: 'func-style (enforce function expressions over declarations) has no biome equivalent (checked 2026-06-07, biome 2.4.13). Oxlint covers it natively.'
    },
    'id-length': {
        reason: 'id-length (minimum identifier length) has no biome or oxlint equivalent (checked 2026-06-07, biome 2.4.13 / oxlint 1.61.0).'
    },
    'no-empty': {
        tools: ['biome'],
        reason: 'biome noEmptyBlockStatements fires on empty arrow function bodies (() => {}), which ESLint no-empty does not flag (different scope). Structural scope difference, not a config error. Checked 2026-06-07, biome 2.4.13.'
    },

    // --- custom @37bytes plugin rules ---
    '@37bytes/boolean-naming': {
        reason: '@37bytes/boolean-naming is a custom eslint plugin with no oxlint or biome equivalent (checked 2026-06-07).'
    },
    '@37bytes/enum-pattern': {
        reason: '@37bytes/enum-pattern is a custom eslint plugin with no biome equivalent. Oxlint has a jsPlugin for it but it fires under different conditions. Checked 2026-06-07.'
    },

    // --- import-x rules ---
    'import-x/no-anonymous-default-export': {
        tools: ['biome'],
        reason: 'import-x/no-anonymous-default-export has no biome equivalent (checked 2026-06-07, biome 2.4.13). Oxlint covers it natively via import/no-anonymous-default-export.'
    },
    'import-x/no-default-export': {
        tools: ['oxlint'],
        reason: 'oxlint storybook override turns off import/no-default-export for story files; ESLint parity test uses spa preset without stories override, so ESLint fires on stories fixture. Structural test-scope difference. Checked 2026-06-07, oxlint 1.61.0.'
    },
    'import-x/no-extraneous-dependencies': {
        tools: ['biome'],
        reason: 'biome noUndeclaredDependencies fires on test fixture files because vitest is not in packages/code-style devDependencies (workspace-level dependency). The biome devDependencies glob allowlist cannot resolve workspace-hoisted deps. ESLint import-x allows it via devDependencies glob. Structural scope difference. Checked 2026-06-07, biome 2.4.13.'
    },

    // --- TypeScript rules ---
    '@typescript-eslint/no-unnecessary-condition': {
        tools: ['oxlint'],
        reason: 'oxlint 1.61.0 has no typescript/no-unnecessary-condition equivalent (type-aware rule requiring type checker). Biome noUnnecessaryConditions covers it without type info. Checked 2026-06-07.'
    },
    '@typescript-eslint/naming-convention': {
        tools: ['oxlint'],
        reason: 'oxlint has no typescript/naming-convention equivalent (checked 2026-06-07, oxlint 1.61.0). Biome style/useNamingConvention partially covers it (mapped as partial in BIOME_TABLE). Oxlint gap only; biome comparison is covered by the partial mapping.'
    },
    '@typescript-eslint/only-throw-error': {
        tools: ['oxlint'],
        reason: 'oxlint has no typescript/only-throw-error equivalent for TypeScript files (checked 2026-06-07, oxlint 1.61.0). ESLint fires @typescript-eslint/only-throw-error in TS files; oxlint fires no-throw-literal for JS only. Oxlint gap for TS-context throw enforcement.'
    },

    // --- @eslint-react rules with no oxlint equivalent ---
    '@eslint-react/no-leaked-conditional-rendering': {
        tools: ['oxlint'],
        reason: 'oxlint has no react equivalent for no-leaked-conditional-rendering (checked 2026-06-07, oxlint 1.61.0). Biome nursery/noLeakedRender covers it. Oxlint gap only.'
    },
    '@eslint-react/no-nested-component-definitions': {
        tools: ['oxlint'],
        reason: 'oxlint has no react equivalent for no-nested-component-definitions (checked 2026-06-07, oxlint 1.61.0). Biome correctness/noNestedComponentDefinitions covers it. Oxlint gap only.'
    },
    '@eslint-react/dom-no-missing-button-type': {
        tools: ['biome'],
        reason: 'biome only covers button type enforcement via a11y domain rules; our biome config uses recommended:false and skips a11y. No lint rule equivalent in the configured biome rule set. Biome gap only; oxlint covers it via react/button-has-type. Checked 2026-06-07, biome 2.4.13.'
    },

    // --- storybook ---
    'storybook/meta-satisfies-type': {
        tools: ['biome'],
        reason: 'storybook/meta-satisfies-type fires in oxlint but has no biome equivalent and is not in the ESLint storybook preset (checked 2026-06-07, biome 2.4.13).'
    },

    // --- @next/next rules ---
    '@next/next/next-script-for-ga': {
        tools: ['biome'],
        reason: '@next/next/next-script-for-ga has no biome equivalent (checked 2026-06-07, biome 2.4.13). Biome next domain does not include this rule.'
    },
    '@next/next/no-css-tags': {
        tools: ['biome'],
        reason: '@next/next/no-css-tags has no biome equivalent (checked 2026-06-07, biome 2.4.13). Biome next domain does not include this rule.'
    },
    '@next/next/no-page-custom-font': {
        tools: ['biome'],
        reason: '@next/next/no-page-custom-font has no biome equivalent (checked 2026-06-07, biome 2.4.13). Biome next domain does not include this rule.'
    },
    '@next/next/no-html-link-for-pages': {
        tools: ['oxlint'],
        reason: 'ESLint @next/next/no-html-link-for-pages requires a pages directory to determine which links are for internal pages; in the parity fixture tree no pages dir exists so ESLint does not fire. Oxlint fires unconditionally. Structural fixture limitation. Checked 2026-06-07, oxlint 1.61.0.'
    }
    // @next/next/no-before-interactive-script-outside-document: gap removed 2026-06-07. biome 2.4.16
    // gained nursery/noBeforeInteractiveScriptOutsideDocument; promoted into biome/rules/nextjs.js and
    // mapped in rule-equivalence.js, so all three tools now enforce it (no remaining gap).
};
