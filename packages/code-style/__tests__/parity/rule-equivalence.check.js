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
    test('renamed Unicorn rules resolve to Oxlint legacy names', () => {
        assert.strictEqual(resolveOxlintEquivalent('unicorn/no-for-each'), 'unicorn/no-array-for-each');
        assert.strictEqual(
            resolveOxlintEquivalent('unicorn/prefer-unicode-code-point-escapes'),
            'unicorn/no-hex-escape'
        );
        assert.strictEqual(resolveOxlintEquivalent('unicorn/dom-node-dataset'), 'unicorn/prefer-dom-node-dataset');
        assert.strictEqual(resolveOxlintEquivalent('unicorn/name-replacements'), null);
    });
    test('@eslint-react rules have NO oxlint equivalent through prefixes (structural bridge gap)', () => {
        assert.strictEqual(resolveOxlintEquivalent('@eslint-react/no-missing-key'), null);
    });
    test('import-x/no-self-import resolves to oxlint (covered natively; the gap is biome-only)', () => {
        // oxlint ships import/no-self-import (verified in `oxlint --rules` and oxlint/config.json
        // base block), so it resolves via the import-x/ -> import/ prefix rename, NOT null.
        assert.strictEqual(resolveOxlintEquivalent('import-x/no-self-import'), 'import/no-self-import');
    });
    test('@typescript-eslint/* bare-name overrides resolve to plain JS names (not typescript/* prefix)', () => {
        // These seven @typescript-eslint/* rules have no typescript/* variant in oxlint; they only
        // exist under the plain (bare) name. The override map fires before the systematic prefix rename.
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-loop-func'), 'no-loop-func');
        assert.strictEqual(
            resolveOxlintEquivalent('@typescript-eslint/no-unused-expressions'),
            'no-unused-expressions'
        );
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-use-before-define'), 'no-use-before-define');
        assert.strictEqual(
            resolveOxlintEquivalent('@typescript-eslint/no-useless-constructor'),
            'no-useless-constructor'
        );
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-unused-vars'), 'no-unused-vars');
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-array-constructor'), 'no-array-constructor');
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-redeclare'), 'no-redeclare');
    });
    test('systematic prefix rename still works for typescript rules with a real typescript/ variant', () => {
        // Verify the override only affects the seven bare-name rules; other @typescript-eslint/* still rename.
        assert.strictEqual(resolveOxlintEquivalent('@typescript-eslint/no-explicit-any'), 'typescript/no-explicit-any');
        assert.strictEqual(
            resolveOxlintEquivalent('@typescript-eslint/no-floating-promises'),
            'typescript/no-floating-promises'
        );
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
        assert.deepStrictEqual(resolveBiomeEquivalent('no-multi-str'), {
            biomeRule: 'style/noMultilineString',
            partial: null
        });
    });
    test('partial equivalence is annotated, not silently equal', () => {
        const resolution = resolveBiomeEquivalent('no-script-url');
        assert.strictEqual(resolution.biomeRule, 'security/noScriptUrl');
        assert.ok(
            resolution.partial,
            'no-script-url must carry a partial-equivalence note (biome checks JSX href only)'
        );
    });
    test('Biome 2.5 promoted nursery rules resolve to stable categories', () => {
        const promotedRules = new Map([
            ['no-proto', 'suspicious/noProto'],
            ['no-useless-return', 'complexity/noUselessReturn'],
            ['unicorn/prefer-global-this', 'style/useGlobalThis'],
            ['@typescript-eslint/no-unnecessary-condition', 'suspicious/noUnnecessaryConditions'],
            ['@eslint-react/no-leaked-conditional-rendering', 'suspicious/noLeakedRender'],
            ['@next/next/no-sync-scripts', 'performance/noSyncScripts'],
            ['@next/next/inline-script-id', 'correctness/useInlineScriptId'],
            [
                '@next/next/no-before-interactive-script-outside-document',
                'correctness/noBeforeInteractiveScriptOutsideDocument'
            ]
        ]);

        for (const [eslintRule, biomeRule] of promotedRules) {
            assert.strictEqual(resolveBiomeEquivalent(eslintRule).biomeRule, biomeRule);
        }
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
    test('reverses oxlint react/ legacy names to @eslint-react/* counterparts', () => {
        // 16 legacy react/* oxlint rules map to their @eslint-react/* (or @stylistic//@37bytes/) counterparts.
        assert.strictEqual(reverseToEslint('oxlint', 'react/jsx-key'), '@eslint-react/no-missing-key');
        assert.strictEqual(reverseToEslint('oxlint', 'react/no-array-index-key'), '@eslint-react/no-array-index-key');
        assert.strictEqual(
            reverseToEslint('oxlint', 'react/jsx-curly-brace-presence'),
            '@stylistic/jsx-curly-brace-presence'
        );
        assert.strictEqual(reverseToEslint('oxlint', 'react/jsx-boolean-value'), '@37bytes/jsx-boolean-value');
        assert.strictEqual(reverseToEslint('oxlint', 'react/jsx-fragments'), '@37bytes/jsx-fragments');
        assert.strictEqual(
            reverseToEslint('oxlint', 'react/jsx-no-target-blank'),
            '@eslint-react/dom-no-unsafe-target-blank'
        );
        assert.strictEqual(
            reverseToEslint('oxlint', 'react/button-has-type'),
            '@eslint-react/dom-no-missing-button-type'
        );
        assert.strictEqual(
            reverseToEslint('oxlint', 'react/no-danger'),
            '@eslint-react/dom-no-dangerously-set-innerhtml'
        );
    });
    test('reverses oxlint unicorn/prefer-node-protocol to n/prefer-node-protocol (active eslint rule)', () => {
        assert.strictEqual(reverseToEslint('oxlint', 'unicorn/prefer-node-protocol'), 'n/prefer-node-protocol');
    });
    test('reverses Oxlint legacy Unicorn names to current ESLint names', () => {
        assert.strictEqual(reverseToEslint('oxlint', 'unicorn/no-array-for-each'), 'unicorn/no-for-each');
        assert.strictEqual(
            reverseToEslint('oxlint', 'unicorn/no-hex-escape'),
            'unicorn/prefer-unicode-code-point-escapes'
        );
        assert.strictEqual(reverseToEslint('oxlint', 'unicorn/prefer-dom-node-dataset'), 'unicorn/dom-node-dataset');
    });
    test('reverses oxlint typescript/no-implied-eval to base eslint rule (not @typescript-eslint/ variant)', () => {
        // oxlint uses typescript/no-implied-eval; ESLint preset has the plain no-implied-eval (javascript.js:108).
        // @typescript-eslint/no-implied-eval is not in the preset.
        assert.strictEqual(reverseToEslint('oxlint', 'typescript/no-implied-eval'), 'no-implied-eval');
    });
    test('reverses oxlint bare names that are @typescript-eslint/* in ESLint', () => {
        // These bare oxlint names map to @typescript-eslint/* because the bare JS rule is disabled in
        // typescript.js and the @typescript-eslint/* version is enabled instead.
        assert.strictEqual(reverseToEslint('oxlint', 'no-loop-func'), '@typescript-eslint/no-loop-func');
        assert.strictEqual(reverseToEslint('oxlint', 'no-unused-vars'), '@typescript-eslint/no-unused-vars');
        assert.strictEqual(
            reverseToEslint('oxlint', 'no-use-before-define'),
            '@typescript-eslint/no-use-before-define'
        );
        assert.strictEqual(
            reverseToEslint('oxlint', 'no-useless-constructor'),
            '@typescript-eslint/no-useless-constructor'
        );
        assert.strictEqual(reverseToEslint('oxlint', 'no-redeclare'), '@typescript-eslint/no-redeclare');
    });
    test('reverses oxlint local jsPlugin triple-path ids to eslint double-path', () => {
        // oxlint injects the plugin name as a path segment: '@scope/<plugin>/<rule>'.
        // eslint omits it: '@scope/<rule>'. The three keys below are the real ones in
        // oxlint/config.json (verified 2026-06-07). Collapse keeps scope + last segment.
        assert.strictEqual(
            reverseToEslint('oxlint', '@37bytes/no-arrow-props/no-arrow-props'),
            '@37bytes/no-arrow-props'
        );
        assert.strictEqual(
            reverseToEslint('oxlint', '@37bytes/no-storage/no-browser-storage'),
            '@37bytes/no-browser-storage'
        );
        assert.strictEqual(reverseToEslint('oxlint', '@37bytes/enum-pattern/enum-pattern'), '@37bytes/enum-pattern');
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
            'vitest/no-duplicate-hooks',
            'promoted into eslint as vitest/no-duplicate-hooks (Task D, 2026-06-07)'
        );
    });
    test('biome many-to-one first-wins: @typescript-eslint/ ordering ensures enabled source wins', () => {
        // suspicious/noRedeclare: @typescript-eslint/no-redeclare is before no-redeclare in BIOME_TABLE.
        // @typescript-eslint/no-redeclare is enabled (typescript.js:34); no-redeclare is off.
        assert.strictEqual(reverseToEslint('biome', 'suspicious/noRedeclare'), '@typescript-eslint/no-redeclare');

        // suspicious/noDuplicateClassMembers: no-dupe-class-members is before @typescript-eslint/no-dupe-class-members.
        // no-dupe-class-members is enabled (javascript.js:102); @typescript-eslint/ variant is off.
        assert.strictEqual(reverseToEslint('biome', 'suspicious/noDuplicateClassMembers'), 'no-dupe-class-members');

        // style/useNodejsImportProtocol: n/prefer-node-protocol is before unicorn/prefer-node-protocol.
        // n/prefer-node-protocol is enabled (node.js:43); unicorn/ variant is not in eslint presets.
        assert.strictEqual(reverseToEslint('biome', 'style/useNodejsImportProtocol'), 'n/prefer-node-protocol');

        // complexity/noStaticOnlyClass: unicorn/no-static-only-class is before @typescript-eslint/no-extraneous-class.
        assert.strictEqual(reverseToEslint('biome', 'complexity/noStaticOnlyClass'), 'unicorn/no-static-only-class');

        // style/useThrowOnlyError: @typescript-eslint/only-throw-error is before no-throw-literal.
        assert.strictEqual(reverseToEslint('biome', 'style/useThrowOnlyError'), '@typescript-eslint/only-throw-error');

        // correctness/noUnusedVariables: @typescript-eslint/no-unused-vars is before no-unused-vars.
        assert.strictEqual(
            reverseToEslint('biome', 'correctness/noUnusedVariables'),
            '@typescript-eslint/no-unused-vars'
        );

        // correctness/noInvalidUseBeforeDeclaration: @typescript-eslint/no-use-before-define is before no-use-before-define.
        assert.strictEqual(
            reverseToEslint('biome', 'correctness/noInvalidUseBeforeDeclaration'),
            '@typescript-eslint/no-use-before-define'
        );

        // complexity/noUselessConstructor: @typescript-eslint/no-useless-constructor is before no-useless-constructor.
        assert.strictEqual(
            reverseToEslint('biome', 'complexity/noUselessConstructor'),
            '@typescript-eslint/no-useless-constructor'
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
    test('reverses oxlint jest/* to vitest/* eslint counterparts (D0 vitest->jest mapping)', () => {
        // oxlint exposes these 11 rules only under jest/* namespace; ESLint presets use vitest/*.
        assert.strictEqual(reverseToEslint('oxlint', 'jest/consistent-test-it'), 'vitest/consistent-test-it');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/no-disabled-tests'), 'vitest/no-disabled-tests');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/no-duplicate-hooks'), 'vitest/no-duplicate-hooks');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/no-focused-tests'), 'vitest/no-focused-tests');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/no-identical-title'), 'vitest/no-identical-title');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/prefer-equality-matcher'), 'vitest/prefer-equality-matcher');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/prefer-to-be'), 'vitest/prefer-to-be');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/prefer-to-contain'), 'vitest/prefer-to-contain');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/prefer-to-have-length'), 'vitest/prefer-to-have-length');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/valid-expect'), 'vitest/valid-expect');
        assert.strictEqual(reverseToEslint('oxlint', 'jest/valid-title'), 'vitest/valid-title');
    });
    test('resolves vitest/* eslint rules to jest/* oxlint equivalents (D0 forward mapping)', () => {
        assert.strictEqual(resolveOxlintEquivalent('vitest/consistent-test-it'), 'jest/consistent-test-it');
        assert.strictEqual(resolveOxlintEquivalent('vitest/no-disabled-tests'), 'jest/no-disabled-tests');
        assert.strictEqual(resolveOxlintEquivalent('vitest/no-duplicate-hooks'), 'jest/no-duplicate-hooks');
        assert.strictEqual(resolveOxlintEquivalent('vitest/no-focused-tests'), 'jest/no-focused-tests');
        assert.strictEqual(resolveOxlintEquivalent('vitest/no-identical-title'), 'jest/no-identical-title');
        assert.strictEqual(resolveOxlintEquivalent('vitest/prefer-equality-matcher'), 'jest/prefer-equality-matcher');
        assert.strictEqual(resolveOxlintEquivalent('vitest/prefer-to-be'), 'jest/prefer-to-be');
        assert.strictEqual(resolveOxlintEquivalent('vitest/prefer-to-contain'), 'jest/prefer-to-contain');
        assert.strictEqual(resolveOxlintEquivalent('vitest/prefer-to-have-length'), 'jest/prefer-to-have-length');
        assert.strictEqual(resolveOxlintEquivalent('vitest/valid-expect'), 'jest/valid-expect');
        assert.strictEqual(resolveOxlintEquivalent('vitest/valid-title'), 'jest/valid-title');
    });
});
