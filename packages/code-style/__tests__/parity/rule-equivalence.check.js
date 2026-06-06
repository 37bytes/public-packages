import assert from 'node:assert';
import { describe, test } from 'node:test';

import {
    OXLINT_PREFIX_RENAMES,
    resolveBiomeEquivalent,
    resolveOxlintEquivalent,
    reverseToEslint
} from './rule-equivalence.js';

describe('resolveOxlintEquivalent', () => {
    test('bare core rules pass through unchanged', () => {
        assert.strictEqual(resolveOxlintEquivalent('no-self-compare'), 'no-self-compare');
    });
    test('systematic prefix renames apply', () => {
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-explicit-any'), 'typescript/no-explicit-any');
        assert.strictEqual(resolveOxlintEquivalent('n/no-process-env'), 'node/no-process-env');
        assert.strictEqual(resolveOxlintEquivalent('@next/next/no-img-element'), 'nextjs/no-img-element');
        assert.strictEqual(resolveOxlintEquivalent('import-x/no-cycle'), 'import/no-cycle');
        assert.strictEqual(resolveOxlintEquivalent('react-hooks/exhaustive-deps'), 'react/exhaustive-deps');
    });
    test('jsPlugin rules keep their eslint names verbatim', () => {
        assert.strictEqual(resolveOxlintEquivalent('sonarjs/cognitive-complexity'), 'sonarjs/cognitive-complexity');
        assert.strictEqual(resolveOxlintEquivalent('regexp/no-empty-group'), 'regexp/no-empty-group');
        assert.strictEqual(resolveOxlintEquivalent('@37bytes/no-arrow-props'), '@37bytes/no-arrow-props');
    });
    test('@eslint-react rules have NO oxlint equivalent through prefixes (structural bridge gap)', () => {
        assert.strictEqual(resolveOxlintEquivalent('@eslint-react/no-missing-key'), null);
    });
});

describe('resolveBiomeEquivalent', () => {
    test('manual table resolves known pairs with category prefixes', () => {
        assert.deepStrictEqual(resolveBiomeEquivalent('no-console'), {
            biomeRule: 'suspicious/noConsole',
            partial: null
        });
        assert.deepStrictEqual(resolveBiomeEquivalent('eqeqeq'), {
            biomeRule: 'suspicious/noDoubleEquals',
            partial: 'eslint smart mode allows == null; biome flags it'
        });
        assert.deepStrictEqual(resolveBiomeEquivalent('@typescript-eslint/naming-convention'), {
            biomeRule: 'style/useNamingConvention',
            partial: 'biome covers fewer selectors than the eslint config'
        });
    });
    test('partial equivalence is annotated, not silently equal', () => {
        const resolution = resolveBiomeEquivalent('no-script-url');
        assert.strictEqual(resolution.biomeRule, 'nursery/noScriptUrl');
        assert.ok(
            resolution.partial,
            'no-script-url must carry a partial-equivalence note (biome checks JSX href only)'
        );
    });
    test('unknown rule returns undefined so callers distinguish unmapped from no-equivalent', () => {
        assert.strictEqual(resolveBiomeEquivalent('totally-unknown-rule'), undefined);
        assert.strictEqual(
            resolveBiomeEquivalent('import-x/no-self-import'),
            null,
            'explicit null = known to have no biome equivalent'
        );
    });
});

describe('reverseToEslint', () => {
    test('reverses oxlint names', () => {
        assert.strictEqual(
            reverseToEslint('oxlint', 'typescript/no-explicit-any'),
            '@typescript-eslint/no-explicit-any'
        );
        assert.strictEqual(reverseToEslint('oxlint', 'no-self-compare'), 'no-self-compare');
        assert.strictEqual(
            reverseToEslint('oxlint', 'react/jsx-handler-names'),
            null,
            'tool-only rule reverses to null'
        );
    });
    test('reverses oxlint import/ prefix back to import-x/', () => {
        assert.strictEqual(reverseToEslint('oxlint', 'import/named'), 'import-x/named');
    });
    test('reverses oxlint react/ back to react-hooks/ for the hooks rules', () => {
        // react/ is ambiguous in oxlint: only the react-hooks reverses (exhaustive-deps,
        // rules-of-hooks) map back; other react/* names are tool-only legacy rules (-> null).
        assert.strictEqual(reverseToEslint('oxlint', 'react/rules-of-hooks'), 'react-hooks/rules-of-hooks');
    });
    test('reverses biome names through the manual table', () => {
        assert.strictEqual(reverseToEslint('biome', 'suspicious/noConsole'), 'no-console');
        assert.strictEqual(
            reverseToEslint('biome', 'style/noCommonJs'),
            'import-x/no-commonjs',
            'mapped: promotes into eslint in the fix phase, so it reverses to its eslint twin'
        );
        assert.strictEqual(
            reverseToEslint('biome', 'suspicious/noDuplicateTestHooks'),
            null,
            'genuinely tool-only (jest/no-duplicate-hooks, not in our preset) reverses to null'
        );
    });
    test('many-to-one biome reverse is first-wins (order-dependent)', () => {
        // Three @typescript-eslint rules map to complexity/noBannedTypes; only the FIRST in
        // BIOME_TABLE order reverses. no-empty-object-type precedes no-unsafe-function-type and
        // no-wrapper-object-types, so it wins. Reordering the table would change this expectation.
        assert.strictEqual(
            reverseToEslint('biome', 'complexity/noBannedTypes'),
            '@typescript-eslint/no-empty-object-type'
        );
    });
});
