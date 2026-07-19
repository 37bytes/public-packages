/**
 * JavaScript rules: ESLint core + unicorn + promise → Biome categories
 *
 * Each rule is annotated with its ESLint source for traceability.
 * Rules are grouped by Biome category (suspicious, style, complexity, correctness, etc.)
 *
 * Source: eslint/rules/javascript.js + eslint/rules/browser.js
 */

export const javascript = {
    suspicious: {
        noAssignInExpressions: 'warn', // no-cond-assign (inspired)
        noAsyncPromiseExecutor: 'error', // no-async-promise-executor
        noCatchAssign: 'warn', // no-ex-assign
        noClassAssign: 'warn', // no-class-assign (from TS)
        noConsole: 'error', // no-console
        noDebugger: 'error', // no-debugger
        noDoubleEquals: 'warn', // eqeqeq
        noDuplicateCase: 'error', // no-duplicate-case
        noDuplicateObjectKeys: 'error', // no-dupe-keys
        noDuplicateParameters: 'error', // no-dupe-args
        noEmptyBlockStatements: 'error', // no-empty
        noFallthroughSwitchClause: 'warn', // no-fallthrough
        useIterableCallbackReturn: 'error', // array-callback-return
        noFunctionAssign: 'error', // no-func-assign
        noGlobalAssign: 'warn', // no-global-assign
        // noGlobalObjectCalls — moved to correctness
        noLabelVar: 'warn', // no-label-var
        noConfusingLabels: 'warn', // no-labels (partial: eslint allows loop labels; biome has allowedLabels option)
        noOctalEscape: 'warn', // no-octal-escape (+ no-octal)
        noProto: 'warn', // no-proto
        noRedeclare: 'warn', // no-redeclare
        // noSelfAssign — moved to correctness
        noSelfCompare: 'error', // no-self-compare (ESLint severity: error)
        noShadowRestrictedNames: 'warn', // no-shadow-restricted-names
        noSparseArray: 'warn', // no-sparse-arrays
        noTemplateCurlyInString: 'warn', // no-template-curly-in-string
        noUnsafeNegation: 'warn', // no-unsafe-negation
        noVar: 'error', // no-var
        useDefaultSwitchClauseLast: 'error', // default-case-last
        useGetterReturn: 'error', // getter-return
        noDocumentCookie: 'error', // unicorn/no-document-cookie
        noThenProperty: 'error', // unicorn/no-thenable
        noWith: 'warn' // no-with
    },
    style: {
        noNestedTernary: 'error', // no-nested-ternary
        noMultilineString: 'warn', // no-multi-str
        useGlobalThis: 'warn', // unicorn/prefer-global-this
        useBlockStatements: 'error', // curly
        useConst: 'warn', // prefer-const
        useDefaultSwitchClause: 'error', // default-case
        useTemplate: 'warn', // prefer-template
        useThrowOnlyError: 'error', // no-throw-literal / @typescript-eslint/only-throw-error (inspired)
        useNodejsImportProtocol: 'warn', // unicorn/prefer-node-protocol
        useThrowNewError: 'warn', // unicorn/throw-new-error
        useTrimStartEnd: 'warn' // unicorn/prefer-string-trim-start-end
    },
    complexity: {
        noExtraBooleanCast: 'error', // no-extra-boolean-cast
        noUselessLabel: 'warn', // no-extra-label
        noUselessLoneBlockStatements: 'warn', // no-lone-blocks
        noCommaOperator: 'warn', // no-sequences
        noUselessConstructor: 'warn', // no-useless-constructor
        noUselessRename: 'warn', // no-useless-rename
        noUselessReturn: 'warn', // no-useless-return
        noUselessStringConcat: 'warn', // no-useless-concat
        useFlatMap: 'warn', // unicorn/prefer-array-flat-map
        useDateNow: 'warn', // unicorn/prefer-date-now
        noUselessEscapeInRegex: 'warn', // no-useless-escape
        noAdjacentSpacesInRegex: 'warn', // no-regex-spaces
        useLiteralKeys: 'warn', // no-useless-computed-key (partial: enforces literal keys over computed)
        noUselessSwitchCase: 'warn', // unicorn/no-useless-switch-case
        useIndexOf: 'warn' // unicorn/prefer-array-index-of
    },
    correctness: {
        noConstAssign: 'error', // no-const-assign
        noEmptyPattern: 'warn', // no-empty-pattern
        noGlobalObjectCalls: 'error', // no-obj-calls
        noSelfAssign: 'warn', // no-self-assign
        noUnreachable: 'error', // no-unreachable
        noUnreachableSuper: 'warn', // no-this-before-super
        noUndeclaredVariables: 'error', // no-undef
        noUnusedVariables: 'warn', // no-unused-vars
        noInvalidUseBeforeDeclaration: 'warn', // no-use-before-define
        useIsNan: 'error', // use-isnan
        useValidTypeof: 'error', // valid-typeof
        useYield: 'warn', // require-yield
        noInvalidBuiltinInstantiation: 'error', // unicorn/new-for-builtins / no-new-native-nonconstructor
        noUnusedLabels: 'warn' // no-unused-labels
    },
    security: {
        noGlobalEval: 'error', // no-eval
        noScriptUrl: 'warn' // no-script-url (partial: Biome checks JSX href only)
    },
    performance: {
        noAwaitInLoops: 'warn', // no-await-in-loop
        noDelete: 'warn' // no-delete-var
    }
};

/**
 * ESLint rules that have NO Biome equivalent (stay ESLint-only):
 *
 * — no-alert, no-caller, no-new-func, no-new-object, no-new-symbol
 * — no-extend-native, no-iterator
 * — no-loop-func, no-labels, no-mixed-operators
 * — no-whitespace-before-property
 * — no-useless-computed-key, no-useless-assignment
 * — dot-location, new-parens, rest-spread-spacing, strict, unicode-bom
 * — no-implied-eval, no-extra-bind
 * — no-promise-executor-return, require-atomic-updates
 * — promise/* (prefer-await-to-then, no-return-in-finally, no-multiple-resolved, etc.)
 * — security/detect-bidi-characters
 * — Most unicorn/* rules (consistent-*, prefer-*, no-array-*, etc.)
 */
