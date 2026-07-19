/**
 * @fileoverview Explicit rule-equivalence mapping between eslint (source of truth),
 * oxlint, and biome rule namespaces.
 *
 * OxLint: systematic prefix renames + verbatim jsPlugin names. @eslint-react/* has NO
 * oxlint counterpart (the bridge only knows legacy react/*) — structural gap, returns null.
 * Biome: NO systematic transform exists (kebab-case vs camelCase, naive strip resolves 0/78);
 * the manual table below IS the mapping. Seeded from inline comments in biome/rules/*.js
 * and biome/eslint-overrides.js (see those files for per-line provenance).
 *
 * Resolution contract:
 *   resolveBiomeEquivalent(eslintRule) -> { biomeRule, partial } | null (known no-equivalent) | undefined (unmapped = test error)
 *   resolveOxlintEquivalent(eslintRule) -> oxlintRule | null
 */

export const OXLINT_PREFIX_RENAMES = {
    '@typescript-eslint/': 'typescript/',
    'n/': 'node/',
    '@next/next/': 'nextjs/',
    'import-x/': 'import/',
    'react-hooks/': 'react/'
};

// @typescript-eslint/* rules that oxlint exposes only under the plain (bare) name.
// The systematic prefix rename (@typescript-eslint/ -> typescript/) is wrong for these:
// oxlint has no `typescript/no-loop-func` etc. — only the bare JS equivalents.
// Checked against `oxlint --rules` and oxlint/config.json (2026-06-07, oxlint 1.61.0).
const OXLINT_TS_BARE_NAME_OVERRIDES = new Map([
    ['@typescript-eslint/no-loop-func', 'no-loop-func'],
    ['@typescript-eslint/no-unused-expressions', 'no-unused-expressions'],
    ['@typescript-eslint/no-use-before-define', 'no-use-before-define'],
    ['@typescript-eslint/no-useless-constructor', 'no-useless-constructor'],
    ['@typescript-eslint/no-unused-vars', 'no-unused-vars'],
    ['@typescript-eslint/no-array-constructor', 'no-array-constructor'],
    ['@typescript-eslint/no-redeclare', 'no-redeclare']
]);

const ESLINT_UNICORN_OXLINT_OVERRIDES = new Map([
    ['unicorn/no-for-each', 'unicorn/no-array-for-each'],
    ['unicorn/prefer-unicode-code-point-escapes', 'unicorn/no-hex-escape'],
    ['unicorn/dom-node-dataset', 'unicorn/prefer-dom-node-dataset']
]);

const OXLINT_UNICORN_TO_ESLINT = new Map(
    [...ESLINT_UNICORN_OXLINT_OVERRIDES].map(([eslintRule, oxlintRule]) => [oxlintRule, eslintRule])
);

// eslint plugins whose rules keep their names verbatim in oxlint jsPlugins
const OXLINT_VERBATIM_PREFIXES = [
    'sonarjs/',
    'regexp/',
    'storybook/',
    '@37bytes/',
    'promise/',
    'unicorn/',
    'vitest/',
    'import/',
    'react/'
];

// vitest/* rules that oxlint exposes only under the jest/* namespace.
// oxlint has a vitest plugin but it does not have counterparts for these 10 rules;
// they are available under jest/* instead (verified 2026-06-07, oxlint 1.61.0).
const VITEST_TO_JEST_MAP = new Map([
    ['vitest/consistent-test-it', 'jest/consistent-test-it'],
    ['vitest/no-disabled-tests', 'jest/no-disabled-tests'],
    ['vitest/no-duplicate-hooks', 'jest/no-duplicate-hooks'],
    ['vitest/no-focused-tests', 'jest/no-focused-tests'],
    ['vitest/no-identical-title', 'jest/no-identical-title'],
    ['vitest/prefer-equality-matcher', 'jest/prefer-equality-matcher'],
    ['vitest/prefer-to-be', 'jest/prefer-to-be'],
    ['vitest/prefer-to-contain', 'jest/prefer-to-contain'],
    ['vitest/prefer-to-have-length', 'jest/prefer-to-have-length'],
    ['vitest/valid-expect', 'jest/valid-expect'],
    ['vitest/valid-title', 'jest/valid-title']
]);

// @eslint-react/* rules that have explicit oxlint equivalents (override the blanket @eslint-react/ prefix ban).
// Most @eslint-react rules have no oxlint counterpart (hence the blanket prefix ban below), but these
// specific rules are covered by legacy react/* names in oxlint (verified 2026-06-07, oxlint 1.61.0).
const ESLINT_REACT_OXLINT_OVERRIDES = new Map([
    // @eslint-react/dom-no-missing-button-type -> react/button-has-type in oxlint
    // Both enforce that every <button> has an explicit type attribute.
    ['@eslint-react/dom-no-missing-button-type', 'react/button-has-type']
]);

// eslint rules known to have NO oxlint equivalent (explicit, so absence is intentional not unmapped)
const OXLINT_NO_EQUIVALENT_PREFIXES = ['@eslint-react/', '@stylistic/', 'security/', 'prefer-arrow-functions/'];
const OXLINT_NO_EQUIVALENT_RULES = new Set([
    'import-x/no-useless-path-segments',
    'unicorn/name-replacements'
    // NOTE: import-x/no-self-import is NOT here — oxlint covers it natively via import/no-self-import
    // (verified in oxlint --rules and oxlint/config.json base block). The gap is biome-only.
    // grow this list during the red-baseline triage; every addition needs a known-gaps entry
]);

// Forward map: ESLint bare JS rule name → oxlint typescript/ rule name.
// Used when oxlint implements the type-aware (typescript/) variant of a plain JS rule.
// eslint-plugin-oxlint 1.68.0 added no-implied-eval to the bridge off-list (new in oxlint 1.68.0);
// oxlint enforces it via the type-aware typescript/no-implied-eval rather than the bare form.
// Key: eslint rule (e.g. 'no-implied-eval'), Value: oxlint rule (e.g. 'typescript/no-implied-eval')
const ESLINT_BARE_TO_OXLINT_TYPESCRIPT = new Map([['no-implied-eval', 'typescript/no-implied-eval']]);

const resolveExplicitOxlintOverride = (eslintRule) =>
    ESLINT_REACT_OXLINT_OVERRIDES.get(eslintRule) ??
    OXLINT_TS_BARE_NAME_OVERRIDES.get(eslintRule) ??
    VITEST_TO_JEST_MAP.get(eslintRule) ??
    ESLINT_UNICORN_OXLINT_OVERRIDES.get(eslintRule);

export const resolveOxlintEquivalent = (eslintRule) => {
    if (OXLINT_NO_EQUIVALENT_RULES.has(eslintRule)) {
        return null;
    }
    const explicitOverride = resolveExplicitOxlintOverride(eslintRule);
    if (explicitOverride !== undefined) {
        return explicitOverride;
    }
    for (const prefix of OXLINT_NO_EQUIVALENT_PREFIXES) {
        if (eslintRule.startsWith(prefix)) {
            return null;
        }
    }
    for (const [eslintPrefix, oxlintPrefix] of Object.entries(OXLINT_PREFIX_RENAMES)) {
        if (eslintRule.startsWith(eslintPrefix)) {
            return oxlintPrefix + eslintRule.slice(eslintPrefix.length);
        }
    }
    for (const prefix of OXLINT_VERBATIM_PREFIXES) {
        if (eslintRule.startsWith(prefix)) {
            return eslintRule;
        }
    }
    // ESLint bare rule that oxlint implements under the typescript/ (type-aware) namespace.
    if (ESLINT_BARE_TO_OXLINT_TYPESCRIPT.has(eslintRule)) {
        return ESLINT_BARE_TO_OXLINT_TYPESCRIPT.get(eslintRule);
    }
    if (!eslintRule.includes('/')) {
        return eslintRule;
    } // bare core rule
    // unmapped namespace — caller treats as test failure
};

/**
 * Manual eslint -> biome table. Value shapes:
 *   string 'category/ruleName'                     full equivalent
 *   { biome: 'category/ruleName', partial: '...' } equivalent with narrower/inspired scope
 *   null                                           known no-equivalent (must pair with known-gaps entry)
 *   absent key                                     resolveBiomeEquivalent returns undefined =>
 *                                                  Layer 1 treats as unmapped (test failure),
 *                                                  distinct from null (known no-equivalent)
 */
const BIOME_TABLE = {
    // --- suspicious (biome/rules/javascript.js:11-39) ---
    'no-cond-assign': { biome: 'suspicious/noAssignInExpressions', partial: 'inspired, broader than no-cond-assign' },
    'no-async-promise-executor': 'suspicious/noAsyncPromiseExecutor',
    'no-ex-assign': 'suspicious/noCatchAssign',
    'no-class-assign': 'suspicious/noClassAssign',
    'no-console': 'suspicious/noConsole',
    'no-debugger': 'suspicious/noDebugger',
    // Confirmed audit finding (options divergence): eslint smart mode allows == null, biome flags
    // it. partialEquivalence exists exactly for this, so keep the partial note.
    eqeqeq: { biome: 'suspicious/noDoubleEquals', partial: 'eslint smart mode allows == null; biome flags it' },
    'no-duplicate-case': 'suspicious/noDuplicateCase',
    'no-dupe-keys': 'suspicious/noDuplicateObjectKeys',
    'no-dupe-args': 'suspicious/noDuplicateParameters',
    'no-empty': 'suspicious/noEmptyBlockStatements',
    'no-fallthrough': 'suspicious/noFallthroughSwitchClause',
    'array-callback-return': 'suspicious/useIterableCallbackReturn',
    'no-func-assign': 'suspicious/noFunctionAssign',
    'no-global-assign': 'suspicious/noGlobalAssign',
    'no-label-var': 'suspicious/noLabelVar',
    'no-labels': {
        biome: 'suspicious/noConfusingLabels',
        partial:
            'eslint allows loop labels ({allowLoop:true}); biome flags all confusing labels but has an allowedLabels option'
    },
    'no-octal-escape': 'suspicious/noOctalEscape',
    // @typescript-eslint/no-redeclare is the active ESLint rule (no-redeclare is disabled in typescript.js).
    // First-wins: @typescript-eslint/no-redeclare must appear before no-redeclare so biome reverse
    // returns the enabled source.
    '@typescript-eslint/no-redeclare': 'suspicious/noRedeclare',
    'no-redeclare': 'suspicious/noRedeclare',
    'no-self-compare': 'suspicious/noSelfCompare',
    'no-shadow-restricted-names': 'suspicious/noShadowRestrictedNames',
    'no-sparse-arrays': 'suspicious/noSparseArray',
    'no-template-curly-in-string': 'suspicious/noTemplateCurlyInString',
    'no-unsafe-negation': 'suspicious/noUnsafeNegation',
    'no-var': 'suspicious/noVar',
    'default-case-last': 'suspicious/useDefaultSwitchClauseLast',
    'getter-return': 'suspicious/useGetterReturn',
    'unicorn/no-document-cookie': 'suspicious/noDocumentCookie',
    'unicorn/no-thenable': 'suspicious/noThenProperty',
    'no-with': 'suspicious/noWith',
    // --- style (javascript.js:41-50) ---
    'no-nested-ternary': 'style/noNestedTernary',
    curly: 'style/useBlockStatements',
    'prefer-const': 'style/useConst',
    'default-case': 'style/useDefaultSwitchClause',
    'prefer-template': 'style/useTemplate',
    // @typescript-eslint/only-throw-error is the active ESLint rule (no-throw-literal is disabled in typescript.js).
    // First-wins: @typescript-eslint/only-throw-error must appear before no-throw-literal so biome
    // reverse returns the enabled source. no-throw-literal stays as a secondary fallback for non-TS contexts.
    '@typescript-eslint/only-throw-error': { biome: 'style/useThrowOnlyError', partial: 'inspired' },
    'no-throw-literal': {
        biome: 'style/useThrowOnlyError',
        partial: 'inspired; also covers @typescript-eslint/only-throw-error'
    },
    // n/prefer-node-protocol is the active ESLint rule (eslint/rules/node.js:43).
    // First-wins: n/prefer-node-protocol must appear before unicorn/prefer-node-protocol so biome
    // reverse returns the enabled source.
    'n/prefer-node-protocol': 'style/useNodejsImportProtocol',
    'unicorn/prefer-node-protocol': 'style/useNodejsImportProtocol',
    'unicorn/throw-new-error': 'style/useThrowNewError',
    'unicorn/prefer-string-trim-start-end': 'style/useTrimStartEnd',
    // --- complexity (javascript.js:52-62) ---
    'no-extra-boolean-cast': 'complexity/noExtraBooleanCast',
    'no-extra-label': 'complexity/noUselessLabel',
    'no-lone-blocks': 'complexity/noUselessLoneBlockStatements',
    'no-sequences': 'complexity/noCommaOperator',
    // @typescript-eslint/no-useless-constructor is the active ESLint rule (no-useless-constructor is disabled).
    // First-wins ordering ensures biome reverse returns the enabled @typescript-eslint/* source.
    '@typescript-eslint/no-useless-constructor': 'complexity/noUselessConstructor',
    'no-useless-constructor': 'complexity/noUselessConstructor',
    'no-useless-rename': 'complexity/noUselessRename',
    'no-useless-concat': 'complexity/noUselessStringConcat',
    'unicorn/prefer-array-flat-map': 'complexity/useFlatMap',
    'unicorn/prefer-date-now': 'complexity/useDateNow',
    'no-useless-escape': 'complexity/noUselessEscapeInRegex',
    'no-regex-spaces': 'complexity/noAdjacentSpacesInRegex',
    'no-useless-computed-key': {
        biome: 'complexity/useLiteralKeys',
        partial:
            'useLiteralKeys enforces literal keys over computed; eslint no-useless-computed-key covers same pattern with some edge case differences'
    },
    'unicorn/no-useless-switch-case': 'complexity/noUselessSwitchCase',
    'unicorn/prefer-array-index-of': 'complexity/useIndexOf',
    // --- correctness (javascript.js:64-78) ---
    'no-const-assign': 'correctness/noConstAssign',
    'no-empty-pattern': 'correctness/noEmptyPattern',
    'no-obj-calls': 'correctness/noGlobalObjectCalls',
    'no-self-assign': 'correctness/noSelfAssign',
    'no-unreachable': 'correctness/noUnreachable',
    'no-this-before-super': 'correctness/noUnreachableSuper',
    'no-undef': 'correctness/noUndeclaredVariables',
    // @typescript-eslint/no-unused-vars is the active ESLint rule (no-unused-vars is disabled in typescript.js).
    // First-wins: @typescript-eslint/no-unused-vars before no-unused-vars so biome reverse picks the enabled source.
    '@typescript-eslint/no-unused-vars': 'correctness/noUnusedVariables',
    'no-unused-vars': 'correctness/noUnusedVariables',
    // @typescript-eslint/no-use-before-define is the active ESLint rule (no-use-before-define is disabled).
    // First-wins: @typescript-eslint/no-use-before-define before no-use-before-define so biome reverse
    // picks the enabled source. Partial: biome covers fewer cases (no typedefs option).
    '@typescript-eslint/no-use-before-define': {
        biome: 'correctness/noInvalidUseBeforeDeclaration',
        partial:
            'biome covers fewer cases (no typedefs option); eslint config uses functions:false, classes:true, variables:true, typedefs:false'
    },
    'no-use-before-define': 'correctness/noInvalidUseBeforeDeclaration',
    'use-isnan': 'correctness/useIsNan',
    'valid-typeof': 'correctness/useValidTypeof',
    'require-yield': 'correctness/useYield',
    'unicorn/new-for-builtins': 'correctness/noInvalidBuiltinInstantiation',
    // no-new-symbol is Symbol-only; noInvalidBuiltinInstantiation covers all builtins (broader).
    // Partial annotation suppresses the severity mismatch check (eslint=warn, biome=error driven by unicorn/new-for-builtins).
    // unicorn/new-for-builtins is the primary canonical for the reverse (first-wins above).
    'no-new-symbol': {
        biome: 'correctness/noInvalidBuiltinInstantiation',
        partial:
            'noInvalidBuiltinInstantiation covers all builtins (Symbol, Array, Object, etc.); eslint no-new-symbol is Symbol-only; severity differs (eslint=warn, biome=error driven by unicorn/new-for-builtins mapping)'
    },
    'no-unused-labels': 'correctness/noUnusedLabels',
    // --- security / performance (javascript.js:81-84) ---
    'no-eval': 'security/noGlobalEval',
    'no-await-in-loop': 'performance/noAwaitInLoops',
    'no-delete-var': 'performance/noDelete',
    // --- Biome 2.5 stable promotions ---
    'no-proto': 'suspicious/noProto',
    'no-script-url': {
        biome: 'security/noScriptUrl',
        partial: 'biome checks JSX href only; eslint also catches string literals (biome/eslint-overrides.js:79-80)'
    },
    'no-multi-str': 'style/noMultilineString',
    'no-useless-return': 'complexity/noUselessReturn',
    'unicorn/prefer-global-this': 'style/useGlobalThis',
    // --- typescript (biome/rules/typescript.js) ---
    // biome style/useArrayLiterals added in Task C (biome 2.4.13, checked 2026-06-07).
    '@typescript-eslint/no-array-constructor': {
        biome: 'style/useArrayLiterals',
        partial:
            'useArrayLiterals enforces array literals over new Array() constructor; broader than no-array-constructor'
    },
    // no-dupe-class-members is enabled in javascript.js:102 (error); @typescript-eslint/no-dupe-class-members
    // is disabled (typescript.js:20 sets it off). First-wins: no-dupe-class-members must be before
    // @typescript-eslint/no-dupe-class-members so biome reverse picks the enabled source.
    'no-dupe-class-members': 'suspicious/noDuplicateClassMembers',
    '@typescript-eslint/no-dupe-class-members': 'suspicious/noDuplicateClassMembers',
    '@typescript-eslint/no-explicit-any': 'suspicious/noExplicitAny',
    '@typescript-eslint/no-extra-non-null-assertion': 'suspicious/noExtraNonNullAssertion',
    '@typescript-eslint/no-misused-new': 'suspicious/noMisleadingInstantiator',
    '@typescript-eslint/no-unsafe-declaration-merging': 'suspicious/noUnsafeDeclarationMerging',
    '@typescript-eslint/consistent-type-imports': { biome: 'style/useImportType', partial: 'inspired' },
    '@typescript-eslint/consistent-type-exports': { biome: 'style/useExportType', partial: 'inspired' },
    '@typescript-eslint/array-type': 'style/useConsistentArrayType',
    '@typescript-eslint/no-namespace': 'style/noNamespace',
    '@typescript-eslint/prefer-as-const': 'style/useAsConstAssertion',
    '@typescript-eslint/naming-convention': {
        biome: 'style/useNamingConvention',
        partial: 'biome covers fewer selectors than the eslint config'
    },
    '@typescript-eslint/no-inferrable-types': 'style/noInferrableTypes',
    '@typescript-eslint/no-unnecessary-type-constraint': 'complexity/noUselessTypeConstraint',
    // unicorn/no-static-only-class is enabled in javascript.js:235 (warn); @typescript-eslint/no-extraneous-class
    // is not enabled in any ESLint preset. First-wins: unicorn/ must be before @typescript-eslint/ so biome
    // reverse picks the enabled source.
    'unicorn/no-static-only-class': 'complexity/noStaticOnlyClass',
    '@typescript-eslint/no-extraneous-class': 'complexity/noStaticOnlyClass',
    '@typescript-eslint/prefer-optional-chain': 'complexity/useOptionalChain',
    '@typescript-eslint/no-empty-object-type': {
        biome: 'complexity/noBannedTypes',
        partial: 'noBannedTypes merges three eslint rules'
    },
    '@typescript-eslint/no-unsafe-function-type': {
        biome: 'complexity/noBannedTypes',
        partial: 'noBannedTypes merges three eslint rules'
    },
    '@typescript-eslint/no-wrapper-object-types': {
        biome: 'complexity/noBannedTypes',
        partial: 'noBannedTypes merges three eslint rules'
    },
    '@typescript-eslint/no-floating-promises': 'nursery/noFloatingPromises',
    '@typescript-eslint/no-misused-promises': 'nursery/noMisusedPromises',
    '@typescript-eslint/no-unnecessary-condition': 'suspicious/noUnnecessaryConditions',
    '@typescript-eslint/switch-exhaustiveness-check': 'nursery/useExhaustiveSwitchCases',
    // --- react (biome/rules/react.js) ---
    // NOTE: biome/rules/react.js comments cite legacy react/* names; the live preset
    // (eslint/rules/react.js) uses @eslint-react/* with jsx-/dom- prefixes. Every @eslint-react
    // key below is verified present in the preset via:
    //   grep -o "'@eslint-react/[a-z-]*'" eslint/rules/react.js | sort -u
    // suspicious/noDuplicateJsxProps: @eslint-react 4.2.3 has no jsx-no-duplicate-props (only no-duplicate-key).
    // Biome rule trimmed from biome/rules/react.js (policy: no extras without eslint counterpart, checked 2026-06-07).
    // complexity/noUselessFragments and correctness/noVoidElementsWithChildren: now promoted into eslint (Task D).
    '@eslint-react/jsx-no-comment-textnodes': 'suspicious/noCommentText', // eslint/rules/react.js:45
    '@eslint-react/no-array-index-key': { biome: 'suspicious/noArrayIndexKey', partial: 'inspired' },
    '@37bytes/jsx-boolean-value': { biome: 'style/noImplicitBoolean', partial: 'inspired' },
    '@stylistic/jsx-curly-brace-presence': { biome: 'style/useConsistentCurlyBraces', partial: 'inspired' },
    '@37bytes/jsx-fragments': 'style/useFragmentSyntax',
    '@eslint-react/no-missing-key': 'correctness/useJsxKeyInIterable',
    '@eslint-react/jsx-no-children-prop': 'correctness/noChildrenProp', // eslint/rules/react.js:64
    'react-hooks/exhaustive-deps': { biome: 'correctness/useExhaustiveDependencies', partial: 'inspired' },
    'react-hooks/rules-of-hooks': 'correctness/useHookAtTopLevel',
    '@eslint-react/dom-no-unsafe-target-blank': 'security/noBlankTarget',
    '@eslint-react/dom-no-dangerously-set-innerhtml': 'security/noDangerouslySetInnerHtml',
    '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'security/noDangerouslySetInnerHtmlWithChildren',
    '@eslint-react/no-leaked-conditional-rendering': 'suspicious/noLeakedRender',
    '@eslint-react/no-nested-component-definitions': 'correctness/noNestedComponentDefinitions',
    // Promoted into eslint in Task D: @eslint-react/jsx-no-useless-fragment and dom-no-void-elements-with-children.
    '@eslint-react/jsx-no-useless-fragment': 'complexity/noUselessFragments',
    '@eslint-react/dom-no-void-elements-with-children': 'correctness/noVoidElementsWithChildren',
    // --- nextjs (biome/rules/nextjs.js) ---
    '@next/next/google-font-display': 'suspicious/useGoogleFontDisplay',
    '@next/next/no-document-import-in-page': 'suspicious/noDocumentImportInPage',
    '@next/next/no-head-import-in-document': 'suspicious/noHeadImportInDocument',
    '@next/next/no-head-element': 'style/noHeadElement',
    '@next/next/no-img-element': 'performance/noImgElement',
    '@next/next/google-font-preconnect': 'performance/useGoogleFontPreconnect',
    '@next/next/no-unwanted-polyfillio': 'performance/noUnwantedPolyfillio',
    '@next/next/no-sync-scripts': 'performance/noSyncScripts',
    '@next/next/inline-script-id': 'correctness/useInlineScriptId',
    '@next/next/no-before-interactive-script-outside-document': 'correctness/noBeforeInteractiveScriptOutsideDocument',
    '@next/next/no-async-client-component': 'correctness/noNextAsyncClientComponent',
    // --- imports (biome/rules/imports.js) ---
    'import-x/no-default-export': 'style/noDefaultExport',
    // Approved policy promotes import-x/no-commonjs INTO eslint in the fix phase. Keeping the entry
    // makes the Layer-1 reverse check red-but-actionable ("biome enables style/noCommonJs ->
    // import-x/no-commonjs, but no eslint preset enables it") and flips it green automatically once
    // the promotion lands. biome/rules/imports.js:13 cites import-x/no-commonjs ('inspired').
    'import-x/no-commonjs': { biome: 'style/noCommonJs', partial: 'inspired' },
    'import-x/no-extraneous-dependencies': {
        biome: 'correctness/noUndeclaredDependencies',
        partial: 'biome has no devDependencies glob allowlist'
    },
    'import-x/no-cycle': 'suspicious/noImportCycles',
    'import-x/no-self-import': null,
    'import-x/no-useless-path-segments': null,
    // biome has no equivalent for import ordering — import-x/first has no biome counterpart (checked 2026-06-07)
    'import-x/first': null,
    // biome has no equivalent for anonymous default export detection (checked 2026-06-07, biome 2.4.13)
    'import-x/no-anonymous-default-export': null,
    // biome has no equivalent for prefer-arrow-functions — eslint-plugin-prefer-arrow-functions is eslint-only
    'prefer-arrow-functions/prefer-arrow-functions': null,
    // --- testing (biome/rules/testing.js) ---
    'vitest/no-focused-tests': { biome: 'suspicious/noFocusedTests', partial: 'inspired' },
    'vitest/no-disabled-tests': { biome: 'suspicious/noSkippedTests', partial: 'inspired' },
    // vitest/no-duplicate-hooks promoted into eslint (no-duplicate-hooks exists in @vitest/eslint-plugin).
    // biome/rules/testing.js:17 has noDuplicateTestHooks (inspired by jest/no-duplicate-hooks).
    'vitest/no-duplicate-hooks': {
        biome: 'suspicious/noDuplicateTestHooks',
        partial:
            'inspired by jest/no-duplicate-hooks; biome covers beforeEach/afterEach nesting, vitest covers all hook types'
    },
    // --- quality (biome/rules/quality.js) ---
    'sonarjs/cognitive-complexity': { biome: 'complexity/noExcessiveCognitiveComplexity', partial: 'inspired' },
    // sonarjs/no-redundant-jump has no biome equivalent (checked 2026-06-07, biome 2.4.13)
    'sonarjs/no-redundant-jump': null,
    // --- formatter-domain rules (biome handles these at formatter level, not as lint rules) ---
    // dot-location: biome formatter enforces dot position; no lint rule (checked 2026-06-07, biome 2.4.13)
    'dot-location': null,
    // new-parens: biome formatter enforces new expression parens; no lint rule (checked 2026-06-07, biome 2.4.13)
    'new-parens': null,
    // no-mixed-operators: no biome lint equivalent; biome formatter handles precedence via parentheses
    'no-mixed-operators': null,
    // no-whitespace-before-property: biome formatter eliminates whitespace before property access
    'no-whitespace-before-property': null,
    // rest-spread-spacing: biome formatter normalizes rest/spread spacing; no lint rule
    'rest-spread-spacing': null,
    // unicorn/number-literal-case: biome formatter normalizes number literal casing; no lint rule
    'unicorn/number-literal-case': null,
    // --- react (biome does not have a lint rule for missing button type; only a11y covers it) ---
    // @eslint-react/dom-no-missing-button-type has no biome lint equivalent (a11y domain only,
    // our config uses recommended:false and skips a11y). Checked 2026-06-07, biome 2.4.13.
    '@eslint-react/dom-no-missing-button-type': null
};

export const resolveBiomeEquivalent = (eslintRule) => {
    const entry = BIOME_TABLE[eslintRule];
    if (entry === undefined) {
        return;
    }
    if (entry === null) {
        return null;
    }
    if (typeof entry === 'string') {
        return { biomeRule: entry, partial: null };
    }
    return { biomeRule: entry.biome, partial: entry.partial };
};

// First-wins for many-to-one mappings: several eslint rules can map to one biome rule
// (e.g. @typescript-eslint/no-empty-object-type, /no-unsafe-function-type, /no-wrapper-object-types
// all -> complexity/noBannedTypes). Only the FIRST one in table order reverses; the others yield
// null. By design — the parity reverse-check only needs ONE enabled eslint source to prove the
// biome rule has a counterpart, not all of them. Order-dependent: reordering the table changes
// which eslint rule wins the reverse (see the pinning test in rule-equivalence.check.js).
const biomeReverse = new Map();
for (const [eslintRule, entry] of Object.entries(BIOME_TABLE)) {
    if (entry === null) {
        continue;
    }
    const biomeRule = typeof entry === 'string' ? entry : entry.biome;
    if (!biomeReverse.has(biomeRule)) {
        biomeReverse.set(biomeRule, eslintRule);
    }
}

// Reverse map for oxlint jest/* rules that correspond to vitest/* in ESLint.
// oxlint only has these rules under jest/* namespace; ESLint presets use vitest/* names.
// Key: oxlint jest/ rule, Value: eslint vitest/ rule
const OXLINT_JEST_TO_VITEST_ESLINT = new Map([
    ['jest/consistent-test-it', 'vitest/consistent-test-it'],
    ['jest/no-disabled-tests', 'vitest/no-disabled-tests'],
    ['jest/no-duplicate-hooks', 'vitest/no-duplicate-hooks'],
    ['jest/no-focused-tests', 'vitest/no-focused-tests'],
    ['jest/no-identical-title', 'vitest/no-identical-title'],
    ['jest/prefer-equality-matcher', 'vitest/prefer-equality-matcher'],
    ['jest/prefer-to-be', 'vitest/prefer-to-be'],
    ['jest/prefer-to-contain', 'vitest/prefer-to-contain'],
    ['jest/prefer-to-have-length', 'vitest/prefer-to-have-length'],
    ['jest/valid-expect', 'vitest/valid-expect'],
    ['jest/valid-title', 'vitest/valid-title']
]);

// Reverse map for oxlint typescript/ rules that map to the BASE (bare) ESLint name rather than
// the @typescript-eslint/* variant. These are rules where oxlint uses the typescript/ prefix but
// the ESLint preset uses the base JS rule (not the TS override).
// Key: oxlint rule (e.g. 'typescript/no-implied-eval'), Value: eslint rule (e.g. 'no-implied-eval')
const OXLINT_TYPESCRIPT_TO_BASE_ESLINT = new Map([['typescript/no-implied-eval', 'no-implied-eval']]);

// Reverse map for oxlint bare names that correspond to @typescript-eslint/* in ESLint.
// These bare rules are disabled in the ESLint preset (typescript.js turns them off) and
// re-enabled under the @typescript-eslint/* namespace; oxlint only has the bare name.
const OXLINT_BARE_TO_TS_ESLINT = new Map([
    ['no-loop-func', '@typescript-eslint/no-loop-func'],
    ['no-unused-expressions', '@typescript-eslint/no-unused-expressions'],
    ['no-use-before-define', '@typescript-eslint/no-use-before-define'],
    ['no-useless-constructor', '@typescript-eslint/no-useless-constructor'],
    ['no-unused-vars', '@typescript-eslint/no-unused-vars'],
    ['no-array-constructor', '@typescript-eslint/no-array-constructor'],
    ['no-redeclare', '@typescript-eslint/no-redeclare']
]);

// Reverse map for oxlint react/ rules that have @eslint-react/* counterparts.
// The systematic prefix-rename loop maps react/* -> @typescript-eslint-like, which is wrong here.
// These are the legacy react/* oxlint names and the enabled @eslint-react/* eslint counterparts.
const OXLINT_REACT_TO_ESLINT_REACT = new Map([
    ['react/jsx-key', '@eslint-react/no-missing-key'],
    ['react/no-array-index-key', '@eslint-react/no-array-index-key'],
    ['react/jsx-curly-brace-presence', '@stylistic/jsx-curly-brace-presence'],
    ['react/jsx-boolean-value', '@37bytes/jsx-boolean-value'],
    ['react/jsx-fragments', '@37bytes/jsx-fragments'],
    ['react/jsx-no-target-blank', '@eslint-react/dom-no-unsafe-target-blank'],
    ['react/jsx-no-comment-textnodes', '@eslint-react/jsx-no-comment-textnodes'],
    ['react/no-unknown-property', '@eslint-react/dom-no-unknown-property'],
    ['react/no-direct-mutation-state', '@eslint-react/no-direct-mutation-state'],
    ['react/no-danger-with-children', '@eslint-react/dom-no-dangerously-set-innerhtml-with-children'],
    ['react/no-children-prop', '@eslint-react/jsx-no-children-prop'],
    ['react/no-danger', '@eslint-react/dom-no-dangerously-set-innerhtml'],
    ['react/jsx-no-script-url', '@eslint-react/dom-no-script-url'],
    ['react/iframe-missing-sandbox', '@eslint-react/dom-no-missing-iframe-sandbox'],
    ['react/button-has-type', '@eslint-react/dom-no-missing-button-type'],
    ['react/style-prop-object', '@eslint-react/dom-no-string-style-prop']
]);

/** Invert the OXLINT_PREFIX_RENAMES table for one toolRule. Returns the eslint counterpart or
 * null if the react/ prefix matches a tool-only rule. Returns undefined if no prefix matched. */
const invertPrefixRename = (toolRule) => {
    for (const [eslintPrefix, oxlintPrefix] of Object.entries(OXLINT_PREFIX_RENAMES)) {
        if (!toolRule.startsWith(oxlintPrefix)) {
            continue;
        }
        // react/ is ambiguous: only react-hooks/* reverses; other react/* are tool-only.
        if (
            oxlintPrefix === 'react/' &&
            !['exhaustive-deps', 'rules-of-hooks'].includes(toolRule.slice(oxlintPrefix.length))
        ) {
            return null;
        }
        return eslintPrefix + toolRule.slice(oxlintPrefix.length);
    }
};

/** Reverse an oxlint rule name to its eslint counterpart. Split out from reverseToEslint to
 * keep cognitive complexity below the sonarjs limit. */
const reverseOxlintToEslint = (toolRule) => {
    // Explicit overrides fire before the systematic loops.
    if (OXLINT_BARE_TO_TS_ESLINT.has(toolRule)) {
        return OXLINT_BARE_TO_TS_ESLINT.get(toolRule);
    }
    if (OXLINT_REACT_TO_ESLINT_REACT.has(toolRule)) {
        return OXLINT_REACT_TO_ESLINT_REACT.get(toolRule);
    }
    if (OXLINT_UNICORN_TO_ESLINT.has(toolRule)) {
        return OXLINT_UNICORN_TO_ESLINT.get(toolRule);
    }
    if (toolRule === 'unicorn/prefer-node-protocol') {
        return 'n/prefer-node-protocol';
    }
    if (OXLINT_JEST_TO_VITEST_ESLINT.has(toolRule)) {
        return OXLINT_JEST_TO_VITEST_ESLINT.get(toolRule);
    }
    if (OXLINT_TYPESCRIPT_TO_BASE_ESLINT.has(toolRule)) {
        return OXLINT_TYPESCRIPT_TO_BASE_ESLINT.get(toolRule);
    }
    const prefixResult = invertPrefixRename(toolRule);
    if (prefixResult !== undefined) {
        return prefixResult;
    }
    // oxlint local jsPlugin rules use a TRIPLE-path id '@scope/<plugin>/<rule>'; eslint uses '@scope/<rule>'.
    // Verified keys: @37bytes/no-arrow-props/no-arrow-props, @37bytes/no-storage/no-browser-storage,
    // @37bytes/enum-pattern/enum-pattern. Collapse by keeping scope + last segment.
    const triplePathMatch = toolRule.match(/^(@[^/]+)\/[^/]+\/([^/]+)$/);
    if (triplePathMatch) {
        return `${triplePathMatch[1]}/${triplePathMatch[2]}`;
    }
    for (const prefix of OXLINT_VERBATIM_PREFIXES) {
        if (toolRule.startsWith(prefix) && prefix !== 'react/' && prefix !== 'import/') {
            return toolRule;
        }
    }
    if (toolRule.startsWith('import/')) {
        return `import-x/${toolRule.slice('import/'.length)}`;
    }
    return toolRule.includes('/') ? null : toolRule;
};

export const reverseToEslint = (tool, toolRule) => {
    if (tool === 'biome') {
        return biomeReverse.get(toolRule) ?? null;
    }
    return reverseOxlintToEslint(toolRule);
};
