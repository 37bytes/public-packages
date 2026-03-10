/**
 * @fileoverview React Compiler ESLint rules
 * @author 37bytes
 *
 * Rules from eslint-plugin-react-hooks 7.x for React Compiler support.
 * These rules help prepare code for React Compiler and catch common issues
 * with component purity, memoization, and state management.
 *
 * Requires: eslint-plugin-react-hooks >= 7.0.0
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * React Compiler rules for @37bytes projects
 * @type {import('eslint').Linter.RulesRecord}
 */
export const reactCompiler = {
    // === Component Purity ===
    // Ensures components are pure and predictable for React Compiler optimization
    'react-hooks/purity': 'error',
    'react-hooks/immutability': 'error',
    'react-hooks/static-components': 'error',

    // === State Management ===
    // Prevents common state-related bugs that break compiler assumptions
    'react-hooks/set-state-in-render': 'error',
    'react-hooks/set-state-in-effect': 'error',

    // === Memoization ===
    // Ensures correct usage of useMemo/useCallback
    'react-hooks/use-memo': 'error',
    'react-hooks/preserve-manual-memoization': 'error',

    // === Refs ===
    // Validates correct ref usage patterns
    'react-hooks/refs': 'error',

    // === Error Handling ===
    'react-hooks/error-boundaries': 'error',

    // === Globals and Config ===
    'react-hooks/globals': 'error',
    'react-hooks/config': 'error',
    'react-hooks/gating': 'error',

    // === Hook Factories ===
    'react-hooks/component-hook-factories': 'error',

    // === Compatibility ===
    // Warns about libraries that may not work well with React Compiler
    'react-hooks/incompatible-library': 'warn',
    'react-hooks/unsupported-syntax': 'warn'
};
