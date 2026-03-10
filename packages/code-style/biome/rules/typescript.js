/**
 * TypeScript rules: @typescript-eslint → Biome categories
 *
 * Two exports:
 * - typescriptRules: base rules applied to all TS files
 * - typescriptOverrides: override block for *.ts/*.tsx (disables + enables)
 *
 * Source: eslint/rules/typescript.js
 */

/**
 * Base TypeScript rules (merged into main config)
 */
export const typescript = {
    suspicious: {
        noDuplicateClassMembers: 'error', // @typescript-eslint/no-dupe-class-members (replaces ESLint)
        noExplicitAny: 'error', // @typescript-eslint/no-explicit-any
        noExtraNonNullAssertion: 'warn', // @typescript-eslint/no-extra-non-null-assertion
        noMisleadingInstantiator: 'warn', // @typescript-eslint/no-misused-new
        noUnsafeDeclarationMerging: 'warn' // @typescript-eslint/no-unsafe-declaration-merging
    },
    style: {
        useImportType: 'error', // @typescript-eslint/consistent-type-imports (inspired)
        useExportType: 'error', // @typescript-eslint/consistent-type-exports (inspired)
        useConsistentArrayType: 'warn', // @typescript-eslint/array-type
        noNamespace: 'warn', // @typescript-eslint/no-namespace
        useAsConstAssertion: 'warn', // @typescript-eslint/prefer-as-const
        useNamingConvention: {
            // @typescript-eslint/naming-convention (inspired)
            level: 'warn',
            options: {
                conventions: [
                    {
                        selector: { kind: 'variable' },
                        formats: ['camelCase', 'PascalCase', 'CONSTANT_CASE']
                    },
                    {
                        selector: { kind: 'function' },
                        formats: ['camelCase', 'PascalCase']
                    },
                    {
                        selector: { kind: 'typeLike' },
                        formats: ['PascalCase']
                    },
                    {
                        selector: { kind: 'enumMember' },
                        formats: ['PascalCase', 'CONSTANT_CASE']
                    },
                    {
                        selector: { kind: 'typeParameter' },
                        formats: ['PascalCase']
                    }
                ]
            }
        },
        noInferrableTypes: 'warn' // @typescript-eslint/no-inferrable-types
    },
    complexity: {
        noBannedTypes: 'error', // @typescript-eslint/ban-types (inspired) — no-empty-object-type, no-unsafe-function-type, no-wrapper-object-types
        noUselessTypeConstraint: 'warn', // @typescript-eslint/no-unnecessary-type-constraint
        noStaticOnlyClass: 'warn', // @typescript-eslint/no-extraneous-class / unicorn/no-static-only-class
        useOptionalChain: 'warn' // @typescript-eslint/prefer-optional-chain
    }
};

/**
 * TypeScript override rules: applied only to *.ts/*.tsx files.
 * Disables JS rules that conflict with TS, enables TS-specific rules.
 */
export const typescriptOverrides = {
    correctness: {
        noUndeclaredVariables: 'off' // no-undef: off for TS (TS handles this)
    }
};

/**
 * Nursery rules (type-aware, experimental in Biome).
 * When they graduate from nursery, move them to typescript above.
 */
export const typescriptNursery = {
    nursery: {
        noFloatingPromises: 'error', // @typescript-eslint/no-floating-promises — #1 ESLint bottleneck
        noMisusedPromises: 'error', // @typescript-eslint/no-misused-promises — #2 ESLint bottleneck
        noUnnecessaryConditions: 'warn', // @typescript-eslint/no-unnecessary-condition
        useExhaustiveSwitchCases: 'warn' // @typescript-eslint/switch-exhaustiveness-check
    }
};

/**
 * ESLint TS rules with NO Biome equivalent (stay ESLint-only):
 *
 * — @typescript-eslint/no-unsafe-argument
 * — @typescript-eslint/no-unsafe-assignment
 * — @typescript-eslint/no-unsafe-call
 * — @typescript-eslint/no-unsafe-member-access
 * — @typescript-eslint/no-unsafe-return
 * — @typescript-eslint/no-misused-promises (nursery, not stable)
 * — @typescript-eslint/no-floating-promises (nursery, not stable)
 * — @typescript-eslint/return-await
 * — @typescript-eslint/consistent-type-assertions
 * — @typescript-eslint/no-empty-object-type (covered by noBannedTypes)
 * — @typescript-eslint/no-unsafe-function-type (covered by noBannedTypes)
 * — @typescript-eslint/no-wrapper-object-types (covered by noBannedTypes)
 */
