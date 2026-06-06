/**
 * @fileoverview Base JavaScript ESLint rules
 * @author 37bytes
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * JavaScript rules for @37bytes projects
 * @type {import('eslint').Linter.RulesRecord}
 */
export const javascript = {
    // === Syntax Basics ===
    'arrow-body-style': ['warn', 'as-needed'], // https://eslint.org/docs/latest/rules/arrow-body-style
    'func-style': ['warn', 'expression'], // https://eslint.org/docs/latest/rules/func-style
    'prefer-arrow-functions/prefer-arrow-functions': [
        'warn',
        {
            allowNamedFunctions: false,
            classPropertiesAllowed: false,
            disallowPrototype: false,
            returnStyle: 'unchanged',
            singleReturnOnly: false
        }
    ], // https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions
    curly: 'error', // https://eslint.org/docs/latest/rules/curly
    'id-length': [
        'warn',
        { min: 3, properties: 'never', exceptions: ['e', 'fs', 'id', 'n', 'os', 'ts', 'vi', 'x', 'y', '_'] }
    ], // https://eslint.org/docs/latest/rules/id-length
    eqeqeq: ['warn', 'smart'], // https://eslint.org/docs/latest/rules/eqeqeq
    'no-console': 'error', // https://eslint.org/docs/latest/rules/no-console
    'no-debugger': 'error', // https://eslint.org/docs/latest/rules/no-debugger
    'no-alert': 'error', // https://eslint.org/docs/latest/rules/no-alert
    'no-empty': 'error', // https://eslint.org/docs/latest/rules/no-empty
    'no-else-return': 'warn', // https://eslint.org/docs/latest/rules/no-else-return
    'no-extra-boolean-cast': ['error', { enforceForLogicalOperands: true }], // https://eslint.org/docs/latest/rules/no-extra-boolean-cast
    'no-var': 'error', // https://eslint.org/docs/latest/rules/no-var
    'no-self-compare': 'error', // https://eslint.org/docs/latest/rules/no-self-compare
    'no-useless-return': 'error', // https://eslint.org/docs/latest/rules/no-useless-return
    'no-implicit-coercion': ['error', { boolean: true, number: true, string: true }], // https://eslint.org/docs/latest/rules/no-implicit-coercion
    'default-case': ['error', { commentPattern: '^no default$' }], // https://eslint.org/docs/latest/rules/default-case
    'default-case-last': 'error', // https://eslint.org/docs/latest/rules/default-case-last
    'prefer-template': 'warn', // https://eslint.org/docs/latest/rules/prefer-template
    'object-shorthand': ['error', 'always'], // https://eslint.org/docs/latest/rules/object-shorthand
    'no-nested-ternary': 'error', // https://eslint.org/docs/latest/rules/no-nested-ternary
    camelcase: ['error', { properties: 'always' }], // https://eslint.org/docs/latest/rules/camelcase

    // === Array and Object Handling ===
    'array-callback-return': 'error', // https://eslint.org/docs/latest/rules/array-callback-return
    'dot-location': ['warn', 'property'], // https://eslint.org/docs/latest/rules/dot-location

    // === Constructors and Classes ===
    'new-parens': 'warn', // https://eslint.org/docs/latest/rules/new-parens
    'no-caller': 'warn', // https://eslint.org/docs/latest/rules/no-caller
    'no-new-func': 'warn', // https://eslint.org/docs/latest/rules/no-new-func
    'no-new-object': 'warn', // https://eslint.org/docs/latest/rules/no-new-object
    'no-new-symbol': 'warn', // https://eslint.org/docs/latest/rules/no-new-symbol
    'no-new-wrappers': 'warn', // https://eslint.org/docs/latest/rules/no-new-wrappers

    // === Conditions and Control Flow ===
    'no-cond-assign': ['warn', 'except-parens'], // https://eslint.org/docs/latest/rules/no-cond-assign
    'no-fallthrough': 'warn', // https://eslint.org/docs/latest/rules/no-fallthrough
    'no-lone-blocks': 'warn', // https://eslint.org/docs/latest/rules/no-lone-blocks
    'no-loop-func': 'warn', // https://eslint.org/docs/latest/rules/no-loop-func
    'no-labels': ['warn', { allowLoop: true, allowSwitch: false }], // https://eslint.org/docs/latest/rules/no-labels
    'no-extra-label': 'warn', // https://eslint.org/docs/latest/rules/no-extra-label
    'no-label-var': 'warn', // https://eslint.org/docs/latest/rules/no-label-var
    'no-sequences': 'warn', // https://eslint.org/docs/latest/rules/no-sequences

    // === Variables and Scope ===
    'prefer-const': ['warn', { destructuring: 'any' }], // https://eslint.org/docs/latest/rules/prefer-const
    'no-useless-assignment': 'warn', // https://eslint.org/docs/latest/rules/no-useless-assignment
    'no-const-assign': 'error', // https://eslint.org/docs/latest/rules/no-const-assign
    'no-delete-var': 'warn', // https://eslint.org/docs/latest/rules/no-delete-var
    'no-global-assign': 'warn', // https://eslint.org/docs/latest/rules/no-global-assign
    'no-shadow-restricted-names': 'warn', // https://eslint.org/docs/latest/rules/no-shadow-restricted-names
    'no-undef': 'error', // https://eslint.org/docs/latest/rules/no-undef
    'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }], // https://eslint.org/docs/latest/rules/no-unused-vars
    'no-use-before-define': ['warn', { functions: false, classes: true, variables: true }], // https://eslint.org/docs/latest/rules/no-use-before-define

    // === Expressions ===
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }], // https://eslint.org/docs/latest/rules/no-unused-expressions
    'no-unused-labels': 'warn', // https://eslint.org/docs/latest/rules/no-unused-labels
    'no-mixed-operators': [
        'warn',
        {
            groups: [
                ['&', '|', '^', '~', '<<', '>>', '>>>'],
                ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                ['&&', '||'],
                ['in', 'instanceof']
            ],
            allowSamePrecedence: false
        }
    ], // https://eslint.org/docs/latest/rules/no-mixed-operators

    // === Duplicates and Errors ===
    'no-class-assign': 'warn', // https://eslint.org/docs/latest/rules/no-class-assign
    'no-dupe-args': 'error', // https://eslint.org/docs/latest/rules/no-dupe-args
    'no-dupe-class-members': 'error', // https://eslint.org/docs/latest/rules/no-dupe-class-members
    'no-dupe-keys': 'error', // https://eslint.org/docs/latest/rules/no-dupe-keys
    'no-duplicate-case': 'error', // https://eslint.org/docs/latest/rules/no-duplicate-case

    // === Security ===
    'no-eval': 'error', // https://eslint.org/docs/latest/rules/no-eval
    'no-implied-eval': 'warn', // https://eslint.org/docs/latest/rules/no-implied-eval
    'no-script-url': 'warn', // https://eslint.org/docs/latest/rules/no-script-url
    'no-extend-native': 'warn', // https://eslint.org/docs/latest/rules/no-extend-native
    'no-iterator': 'warn', // https://eslint.org/docs/latest/rules/no-iterator
    'no-with': 'warn', // https://eslint.org/docs/latest/rules/no-with
    'no-proto': 'warn', // https://eslint.org/docs/latest/rules/no-proto

    // === Security (eslint-plugin-security) ===
    'security/detect-bidi-characters': 'error',
    // === Patterns ===
    'no-empty-pattern': 'warn', // https://eslint.org/docs/latest/rules/no-empty-pattern
    'no-sparse-arrays': 'warn', // https://eslint.org/docs/latest/rules/no-sparse-arrays

    // === Functions ===
    'no-extra-bind': 'warn', // https://eslint.org/docs/latest/rules/no-extra-bind
    'no-func-assign': 'error', // https://eslint.org/docs/latest/rules/no-func-assign
    'no-ex-assign': 'warn', // https://eslint.org/docs/latest/rules/no-ex-assign

    // === Objects ===
    'no-obj-calls': 'error', // https://eslint.org/docs/latest/rules/no-obj-calls
    'no-self-assign': 'warn', // https://eslint.org/docs/latest/rules/no-self-assign
    'getter-return': 'error', // https://eslint.org/docs/latest/rules/getter-return

    // === Strings ===
    'no-multi-str': 'warn', // https://eslint.org/docs/latest/rules/no-multi-str
    'no-octal': 'warn', // https://eslint.org/docs/latest/rules/no-octal
    'no-octal-escape': 'warn', // https://eslint.org/docs/latest/rules/no-octal-escape
    'no-template-curly-in-string': 'warn', // https://eslint.org/docs/latest/rules/no-template-curly-in-string
    'no-useless-concat': 'warn', // https://eslint.org/docs/latest/rules/no-useless-concat
    'no-useless-escape': 'warn', // https://eslint.org/docs/latest/rules/no-useless-escape

    // === Classes ===
    'no-this-before-super': 'warn', // https://eslint.org/docs/latest/rules/no-this-before-super
    'no-useless-constructor': 'warn', // https://eslint.org/docs/latest/rules/no-useless-constructor

    // === Errors and Exceptions ===
    'no-throw-literal': 'warn', // https://eslint.org/docs/latest/rules/no-throw-literal
    'no-unreachable': 'error', // https://eslint.org/docs/latest/rules/no-unreachable

    // === Naming and Code Style ===
    'no-useless-computed-key': 'warn', // https://eslint.org/docs/latest/rules/no-useless-computed-key
    'no-useless-rename': ['warn', { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false }], // https://eslint.org/docs/latest/rules/no-useless-rename
    'no-whitespace-before-property': 'warn', // https://eslint.org/docs/latest/rules/no-whitespace-before-property

    // === Type Safety ===
    'no-unsafe-negation': 'warn', // https://eslint.org/docs/latest/rules/no-unsafe-negation
    'use-isnan': 'error', // https://eslint.org/docs/latest/rules/use-isnan
    'valid-typeof': 'error', // https://eslint.org/docs/latest/rules/valid-typeof

    // === Async/Await ===
    'no-async-promise-executor': 'error', // https://eslint.org/docs/latest/rules/no-async-promise-executor
    'no-await-in-loop': 'warn', // https://eslint.org/docs/latest/rules/no-await-in-loop
    'no-promise-executor-return': 'error', // https://eslint.org/docs/latest/rules/no-promise-executor-return
    'require-atomic-updates': 'warn', // https://eslint.org/docs/latest/rules/require-atomic-updates

    // === Promises (eslint-plugin-promise) ===
    'promise/prefer-await-to-then': 'warn',
    'promise/no-return-in-finally': 'error',
    'promise/no-multiple-resolved': 'error',
    'promise/no-callback-in-promise': 'warn',
    'promise/spec-only': 'error',

    // === Generators and Iterators ===
    'require-yield': 'warn', // https://eslint.org/docs/latest/rules/require-yield

    // === ES6+ Syntax ===
    'rest-spread-spacing': ['warn', 'never'], // https://eslint.org/docs/latest/rules/rest-spread-spacing

    // === Module System ===
    strict: ['warn', 'never'], // https://eslint.org/docs/latest/rules/strict

    // === Unicode ===
    'unicode-bom': ['warn', 'never'], // https://eslint.org/docs/latest/rules/unicode-bom

    // === Unicorn ===
    'unicorn/catch-error-name': 'warn',
    'unicorn/prevent-abbreviations': [
        'warn',
        {
            ignore: [/e2e/i],
            replacements: {
                args: false,
                ctx: false,
                def: false,
                dev: false,
                dir: false,
                docs: false,
                env: false,
                lib: false,
                param: false,
                params: false,
                pkg: false,
                prev: false,
                prod: false,
                prop: false,
                props: false,
                ref: false,
                refs: false,
                src: false,
                utils: false
            }
        }
    ],
    'unicorn/consistent-assert': 'error',
    'unicorn/consistent-date-clone': 'warn',
    'unicorn/consistent-destructuring': 'warn',
    'unicorn/consistent-empty-array-spread': 'error',
    'unicorn/consistent-existence-index-check': 'warn',
    'unicorn/consistent-function-scoping': 'warn',
    'unicorn/custom-error-definition': 'error',
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-accessor-recursion': 'error',
    'unicorn/no-array-callback-reference': 'error',
    'unicorn/no-array-method-this-argument': 'warn',
    'unicorn/no-array-reverse': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-array-sort': 'error',
    'unicorn/no-await-expression-member': 'warn',
    'unicorn/no-await-in-promise-methods': 'error',
    'unicorn/no-hex-escape': 'warn',
    'unicorn/no-immediate-mutation': 'error',
    'unicorn/no-instanceof-builtins': 'warn',
    'unicorn/no-named-default': 'warn',
    'unicorn/no-negation-in-equality-check': 'error',
    'unicorn/no-new-array': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-single-promise-in-promise-methods': 'warn',
    'unicorn/no-static-only-class': 'warn',
    'unicorn/no-thenable': 'error',
    'unicorn/no-this-assignment': 'warn',
    'unicorn/no-unnecessary-array-flat-depth': 'warn',
    'unicorn/no-unnecessary-array-splice-count': 'warn',
    'unicorn/no-unnecessary-await': 'warn',
    'unicorn/no-unnecessary-slice-end': 'warn',
    'unicorn/no-unreadable-array-destructuring': 'warn',
    'unicorn/no-unreadable-iife': 'warn',
    'unicorn/no-useless-collection-argument': 'warn',
    'unicorn/no-useless-error-capture-stack-trace': 'warn',
    'unicorn/no-useless-fallback-in-spread': 'warn',
    'unicorn/no-useless-length-check': 'warn',
    'unicorn/no-useless-promise-resolve-reject': 'warn',
    'unicorn/no-useless-spread': 'warn',
    'unicorn/no-useless-switch-case': 'warn',
    'unicorn/no-useless-undefined': 'warn',
    'unicorn/no-zero-fractions': 'warn',
    'unicorn/number-literal-case': 'warn',
    'unicorn/numeric-separators-style': 'warn',
    'unicorn/prefer-array-find': 'warn',
    'unicorn/prefer-array-flat': 'warn',
    'unicorn/prefer-array-flat-map': 'warn',
    'unicorn/prefer-array-index-of': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'unicorn/prefer-array-some': 'warn',
    'unicorn/prefer-at': 'warn',
    'unicorn/prefer-code-point': 'warn',
    'unicorn/prefer-date-now': 'warn',
    'unicorn/prefer-default-parameters': 'warn',
    'unicorn/prefer-export-from': 'warn',
    'unicorn/prefer-global-this': 'warn',
    'unicorn/prefer-includes': 'warn',
    'unicorn/prefer-logical-operator-over-ternary': 'warn',
    'unicorn/prefer-math-min-max': 'warn',
    'unicorn/prefer-math-trunc': 'error',
    'unicorn/prefer-modern-math-apis': 'warn',
    'unicorn/prefer-native-coercion-functions': 'warn',
    'unicorn/prefer-negative-index': 'warn',
    'unicorn/prefer-object-from-entries': 'warn',
    'unicorn/prefer-set-has': 'warn',
    'unicorn/prefer-set-size': 'warn',
    'unicorn/prefer-spread': 'warn',
    'unicorn/prefer-string-replace-all': 'warn',
    'unicorn/prefer-string-slice': 'warn',
    'unicorn/prefer-string-starts-ends-with': 'warn',
    'unicorn/prefer-string-trim-start-end': 'warn',
    'unicorn/prefer-structured-clone': 'warn',
    'unicorn/prefer-switch': 'warn',
    'unicorn/prefer-top-level-await': 'warn',
    'unicorn/relative-url-style': 'warn',
    'unicorn/require-array-join-separator': 'warn',
    'unicorn/require-number-to-fixed-digits-argument': 'warn',
    'unicorn/text-encoding-identifier-case': 'warn',
    'unicorn/throw-new-error': 'warn',
    'unicorn/prefer-class-fields': 'warn',
    'unicorn/prefer-import-meta-properties': 'warn'
};
