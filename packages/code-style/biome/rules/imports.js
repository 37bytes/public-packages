/**
 * Import rules: import-x → Biome categories
 *
 * Biome has limited import rule coverage.
 * Most import-x rules stay ESLint-only.
 *
 * Source: eslint/rules/imports.js
 */

export const imports = {
    style: {
        noDefaultExport: 'error', // import-x/no-default-export
        noCommonJs: 'error' // import-x/no-commonjs (inspired)
    },
    correctness: {
        // import-x/no-extraneous-dependencies (partial: biome has no devDependencies glob allowlist option)
        // Mirror ESLint's devDependencies glob restriction: devDeps allowed in test files and stories only.
        noUndeclaredDependencies: {
            level: 'error',
            options: {
                devDependencies: [
                    '**/__tests__/**',
                    '**/*.test.ts',
                    '**/*.test.tsx',
                    '**/*.spec.ts',
                    '**/*.spec.tsx',
                    '**/*.stories.tsx',
                    '**/*.stories.ts'
                ]
            }
        }
    },
    // Note: noImportCycles was in nursery in v2.0.0, moved to suspicious in v2.4.4
    suspicious: {
        noImportCycles: 'error' // import-x/no-cycle
    }
};

/**
 * ESLint import rules with NO Biome equivalent (stay ESLint-only):
 *
 * — import-x/first
 * — import-x/newline-after-import
 * — import-x/order (use perfectionist or Biome formatter)
 * — import-x/no-mutable-exports
 * — import-x/no-anonymous-default-export
 * — import-x/no-duplicates
 * — import-x/no-self-import
 * — import-x/no-empty-named-blocks
 * — import-x/no-useless-path-segments
 * — import-x/no-amd
 * — import-x/no-webpack-loader-syntax
 * — unicorn/prefer-import-meta-properties
 */
