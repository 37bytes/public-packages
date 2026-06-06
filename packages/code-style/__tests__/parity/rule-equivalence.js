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

// eslint rules known to have NO oxlint equivalent (explicit, so absence is intentional not unmapped)
const OXLINT_NO_EQUIVALENT_PREFIXES = ['@eslint-react/', '@stylistic/', 'security/', 'prefer-arrow-functions/'];
const OXLINT_NO_EQUIVALENT_RULES = new Set([
    'import-x/no-useless-path-segments',
    'import-x/no-self-import'
    // grow this list during the red-baseline triage; every addition needs a known-gaps entry
]);

export function resolveOxlintEquivalent(eslintRule) {
    if (OXLINT_NO_EQUIVALENT_RULES.has(eslintRule)) return null;
    for (const prefix of OXLINT_NO_EQUIVALENT_PREFIXES) {
        if (eslintRule.startsWith(prefix)) return null;
    }
    for (const [eslintPrefix, oxlintPrefix] of Object.entries(OXLINT_PREFIX_RENAMES)) {
        if (eslintRule.startsWith(eslintPrefix)) return oxlintPrefix + eslintRule.slice(eslintPrefix.length);
    }
    for (const prefix of OXLINT_VERBATIM_PREFIXES) {
        if (eslintRule.startsWith(prefix)) return eslintRule;
    }
    if (!eslintRule.includes('/')) return eslintRule; // bare core rule
    return undefined; // unmapped namespace — caller treats as test failure
}

/**
 * Manual eslint -> biome table. Value shapes:
 *   string 'category/ruleName'                     full equivalent
 *   { biome: 'category/ruleName', partial: '...' } equivalent with narrower/inspired scope
 *   null                                           known no-equivalent (must pair with known-gaps entry)
 */
const BIOME_TABLE = {
    // --- suspicious (biome/rules/javascript.js:11-39) ---
    'no-cond-assign': { biome: 'suspicious/noAssignInExpressions', partial: 'inspired, broader than no-cond-assign' },
    'no-async-promise-executor': 'suspicious/noAsyncPromiseExecutor',
    'no-ex-assign': 'suspicious/noCatchAssign',
    'no-class-assign': 'suspicious/noClassAssign',
    'no-console': 'suspicious/noConsole',
    'no-debugger': 'suspicious/noDebugger',
    // Plan's test asserts eqeqeq resolves with partial:null (full equivalent), so this is a
    // plain-string entry. The plan table's partial note ('== null' difference) contradicted its
    // own Step 1 test; the test is the contract.
    eqeqeq: 'suspicious/noDoubleEquals',
    'no-duplicate-case': 'suspicious/noDuplicateCase',
    'no-dupe-keys': 'suspicious/noDuplicateObjectKeys',
    'no-dupe-args': 'suspicious/noDuplicateParameters',
    'no-empty': 'suspicious/noEmptyBlockStatements',
    'no-fallthrough': 'suspicious/noFallthroughSwitchClause',
    'no-func-assign': 'suspicious/noFunctionAssign',
    'no-global-assign': 'suspicious/noGlobalAssign',
    'no-label-var': 'suspicious/noLabelVar',
    'no-octal-escape': 'suspicious/noOctalEscape',
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
    // --- style (javascript.js:41-50) ---
    'no-nested-ternary': 'style/noNestedTernary',
    curly: 'style/useBlockStatements',
    'prefer-const': 'style/useConst',
    'default-case': 'style/useDefaultSwitchClause',
    'prefer-template': 'style/useTemplate',
    'no-throw-literal': {
        biome: 'style/useThrowOnlyError',
        partial: 'inspired; also covers @typescript-eslint/only-throw-error'
    },
    'unicorn/prefer-node-protocol': 'style/useNodejsImportProtocol',
    'unicorn/throw-new-error': 'style/useThrowNewError',
    'unicorn/prefer-string-trim-start-end': 'style/useTrimStartEnd',
    // --- complexity (javascript.js:52-62) ---
    'no-extra-boolean-cast': 'complexity/noExtraBooleanCast',
    'no-extra-label': 'complexity/noUselessLabel',
    'no-lone-blocks': 'complexity/noUselessLoneBlockStatements',
    'no-sequences': 'complexity/noCommaOperator',
    'no-useless-constructor': 'complexity/noUselessConstructor',
    'no-useless-rename': 'complexity/noUselessRename',
    'no-useless-concat': 'complexity/noUselessStringConcat',
    'unicorn/prefer-array-flat-map': 'complexity/useFlatMap',
    'unicorn/prefer-date-now': 'complexity/useDateNow',
    'no-useless-escape': 'complexity/noUselessEscapeInRegex',
    // --- correctness (javascript.js:64-78) ---
    'no-const-assign': 'correctness/noConstAssign',
    'no-empty-pattern': 'correctness/noEmptyPattern',
    'no-obj-calls': 'correctness/noGlobalObjectCalls',
    'no-self-assign': 'correctness/noSelfAssign',
    'no-unreachable': 'correctness/noUnreachable',
    'no-this-before-super': 'correctness/noUnreachableSuper',
    'no-undef': 'correctness/noUndeclaredVariables',
    'no-unused-vars': 'correctness/noUnusedVariables',
    'no-use-before-define': 'correctness/noInvalidUseBeforeDeclaration',
    'use-isnan': 'correctness/useIsNan',
    'valid-typeof': 'correctness/useValidTypeof',
    'require-yield': 'correctness/useYield',
    'unicorn/new-for-builtins': 'correctness/noInvalidBuiltinInstantiation',
    'no-unused-labels': 'correctness/noUnusedLabels',
    // --- security / performance (javascript.js:81-84) ---
    'no-eval': 'security/noGlobalEval',
    'no-await-in-loop': 'performance/noAwaitInLoops',
    // --- nursery (javascript.js:108-116) ---
    'no-proto': 'nursery/noProto',
    'no-script-url': {
        biome: 'nursery/noScriptUrl',
        partial: 'biome checks JSX href only; eslint also catches string literals (biome/eslint-overrides.js:79-80)'
    },
    'no-multi-str': 'nursery/noMultiStr',
    'no-useless-return': 'nursery/noUselessReturn',
    'unicorn/prefer-global-this': 'nursery/useGlobalThis',
    // --- typescript (biome/rules/typescript.js) ---
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
    '@typescript-eslint/no-extraneous-class': 'complexity/noStaticOnlyClass',
    'unicorn/no-static-only-class': 'complexity/noStaticOnlyClass',
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
    '@typescript-eslint/no-unnecessary-condition': 'nursery/noUnnecessaryConditions',
    '@typescript-eslint/switch-exhaustiveness-check': 'nursery/useExhaustiveSwitchCases',
    '@typescript-eslint/only-throw-error': { biome: 'style/useThrowOnlyError', partial: 'inspired' },
    // --- react (biome/rules/react.js) ---
    // NOTE: the biome/rules/react.js comments cite legacy react/* names; the live eslint
    // preset (eslint/rules/react.js) uses @eslint-react/* with jsx-/dom- prefixes. Both the
    // plan's transcribed keys AND the real eslint keys are listed so the manual table resolves
    // either spelling. See TABLE ADDITIONS in the task report.
    '@eslint-react/no-comment-textnodes': 'suspicious/noCommentText',
    '@eslint-react/jsx-no-comment-textnodes': 'suspicious/noCommentText', // real eslint name (eslint/rules/react.js:45)
    '@eslint-react/no-duplicate-jsx-props': 'suspicious/noDuplicateJsxProps',
    '@eslint-react/no-array-index-key': { biome: 'suspicious/noArrayIndexKey', partial: 'inspired' },
    '@37bytes/jsx-boolean-value': { biome: 'style/noImplicitBoolean', partial: 'inspired' },
    '@stylistic/jsx-curly-brace-presence': { biome: 'style/useConsistentCurlyBraces', partial: 'inspired' },
    '@37bytes/jsx-fragments': 'style/useFragmentSyntax',
    '@eslint-react/no-useless-fragment': 'complexity/noUselessFragments',
    '@eslint-react/jsx-no-useless-fragment': 'complexity/noUselessFragments', // real eslint name (@eslint-react plugin)
    '@eslint-react/no-missing-key': 'correctness/useJsxKeyInIterable',
    '@eslint-react/no-children-prop': 'correctness/noChildrenProp',
    '@eslint-react/jsx-no-children-prop': 'correctness/noChildrenProp', // real eslint name (eslint/rules/react.js:64)
    'react-hooks/exhaustive-deps': { biome: 'correctness/useExhaustiveDependencies', partial: 'inspired' },
    'react-hooks/rules-of-hooks': 'correctness/useHookAtTopLevel',
    '@eslint-react/dom-no-void-elements-with-children': 'correctness/noVoidElementsWithChildren',
    '@eslint-react/dom-no-unsafe-target-blank': 'security/noBlankTarget',
    '@eslint-react/dom-no-dangerously-set-innerhtml': 'security/noDangerouslySetInnerHtml',
    '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'security/noDangerouslySetInnerHtmlWithChildren',
    '@eslint-react/no-leaked-conditional-rendering': 'nursery/noLeakedRender',
    // --- nextjs (biome/rules/nextjs.js) ---
    '@next/next/google-font-display': 'suspicious/useGoogleFontDisplay',
    '@next/next/no-document-import-in-page': 'suspicious/noDocumentImportInPage',
    '@next/next/no-head-import-in-document': 'suspicious/noHeadImportInDocument',
    '@next/next/no-head-element': 'style/noHeadElement',
    '@next/next/no-img-element': 'performance/noImgElement',
    '@next/next/google-font-preconnect': 'performance/useGoogleFontPreconnect',
    '@next/next/no-unwanted-polyfillio': 'performance/noUnwantedPolyfillio',
    '@next/next/no-sync-scripts': 'nursery/noSyncScripts',
    '@next/next/inline-script-id': 'nursery/useInlineScriptId',
    '@next/next/no-async-client-component': 'correctness/noNextAsyncClientComponent',
    // --- imports (biome/rules/imports.js) ---
    'import-x/no-default-export': 'style/noDefaultExport',
    // NOTE: biome's style/noCommonJs is intentionally NOT mapped here. The biome/rules/imports.js
    // comment cites import-x/no-commonjs ('inspired'), but that rule is NOT in our eslint preset
    // (eslint/rules/imports.js has no no-commonjs). Mapping it would make style/noCommonJs reverse
    // to a rule no preset enables; treating it as tool-only (reverse -> null) is correct.
    'import-x/no-extraneous-dependencies': {
        biome: 'correctness/noUndeclaredDependencies',
        partial: 'biome has no devDependencies glob allowlist'
    },
    'import-x/no-cycle': 'suspicious/noImportCycles',
    'import-x/no-self-import': null,
    'import-x/no-useless-path-segments': null,
    // --- testing (biome/rules/testing.js) ---
    'vitest/no-focused-tests': { biome: 'suspicious/noFocusedTests', partial: 'inspired' },
    'vitest/no-disabled-tests': { biome: 'suspicious/noSkippedTests', partial: 'inspired' },
    // --- quality (biome/rules/quality.js) ---
    'sonarjs/cognitive-complexity': { biome: 'complexity/noExcessiveCognitiveComplexity', partial: 'inspired' }
};

export function resolveBiomeEquivalent(eslintRule) {
    const entry = BIOME_TABLE[eslintRule];
    if (entry === undefined) return undefined;
    if (entry === null) return null;
    if (typeof entry === 'string') return { biomeRule: entry, partial: null };
    return { biomeRule: entry.biome, partial: entry.partial };
}

const biomeReverse = new Map();
for (const [eslintRule, entry] of Object.entries(BIOME_TABLE)) {
    if (entry === null) continue;
    const biomeRule = typeof entry === 'string' ? entry : entry.biome;
    if (!biomeReverse.has(biomeRule)) biomeReverse.set(biomeRule, eslintRule);
}

export function reverseToEslint(tool, toolRule) {
    if (tool === 'biome') return biomeReverse.get(toolRule) ?? null;
    // oxlint: invert prefix renames, then verbatim prefixes, then bare names
    for (const [eslintPrefix, oxlintPrefix] of Object.entries(OXLINT_PREFIX_RENAMES)) {
        if (toolRule.startsWith(oxlintPrefix)) {
            const candidate = eslintPrefix + toolRule.slice(oxlintPrefix.length);
            // react/ is ambiguous: react-hooks/exhaustive-deps reverses, react/jsx-handler-names does not
            if (
                oxlintPrefix === 'react/' &&
                !['exhaustive-deps', 'rules-of-hooks'].includes(toolRule.slice(oxlintPrefix.length))
            )
                continue;
            return candidate;
        }
    }
    for (const prefix of OXLINT_VERBATIM_PREFIXES) {
        if (toolRule.startsWith(prefix) && prefix !== 'react/' && prefix !== 'import/') return toolRule;
    }
    if (toolRule.startsWith('import/')) return 'import-x/' + toolRule.slice('import/'.length);
    if (!toolRule.includes('/')) return toolRule;
    return null;
}
