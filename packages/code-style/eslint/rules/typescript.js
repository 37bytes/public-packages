/**
 * @fileoverview TypeScript ESLint rules
 * @author 37bytes
 *
 * These rules extend JavaScript rules with TypeScript-specific behavior.
 * Some JS rules are disabled and replaced with their TypeScript equivalents.
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * TypeScript rules for @37bytes projects
 * @type {import('eslint').Linter.RulesRecord}
 */
export const typescript = {
    // === Disable conflicting JavaScript rules ===
    // These are replaced with TypeScript equivalents below
    'no-dupe-class-members': 'off',
    'no-undef': 'off',
    'no-array-constructor': 'off',
    'no-redeclare': 'off',
    'no-use-before-define': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    'no-useless-constructor': 'off',
    'no-loop-func': 'off',
    'no-throw-literal': 'off',
    camelcase: 'off', // Replaced by @typescript-eslint/naming-convention

    // === TypeScript equivalents of JS rules ===
    '@typescript-eslint/no-array-constructor': 'warn',
    '@typescript-eslint/no-redeclare': 'warn',
    '@typescript-eslint/no-use-before-define': [
        'warn',
        {
            functions: false,
            classes: true,
            variables: true,
            typedefs: false
        }
    ],
    '@typescript-eslint/no-loop-func': 'warn',
    '@typescript-eslint/only-throw-error': [
        'error',
        {
            allowThrowingAny: false,
            allowThrowingUnknown: true
        }
    ],
    '@typescript-eslint/no-unused-expressions': [
        'error',
        {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true
        }
    ],
    '@typescript-eslint/no-unused-vars': [
        'warn',
        {
            args: 'none',
            ignoreRestSiblings: true
        }
    ],
    '@typescript-eslint/no-useless-constructor': 'warn',

    // === Type Imports/Exports ===
    '@typescript-eslint/consistent-type-imports': [
        'error',
        {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
            disallowTypeAnnotations: true
        }
    ],
    '@typescript-eslint/consistent-type-exports': [
        'error',
        {
            fixMixedExportsWithInlineTypeSpecifier: true
        }
    ],

    // === Redundant undefined in optional types ===
    '@37bytes/no-redundant-undefined': 'error',

    // === Type Assertions ===
    '@typescript-eslint/consistent-type-assertions': 'warn',

    // === Type Safety (strict) ===
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-empty-object-type': 'error',
    '@typescript-eslint/no-unsafe-function-type': 'error',
    '@typescript-eslint/no-wrapper-object-types': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',

    // === Promises and Async ===
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/return-await': 'error',

    // === Naming Conventions ===
    '@typescript-eslint/naming-convention': [
        'error',
        // Default: camelCase for everything
        {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
        },
        // Variables: camelCase, UPPER_CASE for constants, PascalCase for React components
        {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow'
        },
        // Functions: camelCase or PascalCase (for React components)
        {
            selector: 'function',
            format: ['camelCase', 'PascalCase']
        },
        // Parameters: camelCase
        {
            selector: 'parameter',
            format: ['camelCase'],
            leadingUnderscore: 'allow'
        },
        // Destructured parameters: any format. Consumer cannot rename a destructured
        // binding without `:` syntax, so when the source API exposes a PascalCase prop
        // (e.g. polymorphic `Element` in UI kits) the local binding has to follow.
        {
            selector: 'parameter',
            modifiers: ['destructured'],
            format: null
        },
        // Imports: camelCase or PascalCase (for classes, React components)
        {
            selector: 'import',
            format: ['camelCase', 'PascalCase']
        },
        // Object literal properties: allow any format for external APIs
        {
            selector: 'objectLiteralProperty',
            format: null
        },
        // Type properties: camelCase or PascalCase. The latter is required for
        // React component props that hold an element type (e.g.
        // `interface Props { Element: ComponentType }` for polymorphic components).
        {
            selector: 'typeProperty',
            format: ['camelCase', 'PascalCase']
        },
        // Types and Interfaces: PascalCase without prefixes
        {
            selector: 'typeLike',
            format: ['PascalCase']
        },
        // Interfaces: no I-prefix (IUserData → UserData)
        {
            selector: 'interface',
            format: ['PascalCase'],
            custom: { regex: '^I[A-Z]', match: false }
        },
        // Type aliases: no T-prefix (TUserId → UserId)
        {
            selector: 'typeAlias',
            format: ['PascalCase'],
            custom: { regex: '^T[A-Z]', match: false }
        },
        // Type parameters (generics): no T-prefix (TItem → ItemType)
        {
            selector: 'typeParameter',
            format: ['PascalCase'],
            custom: { regex: '^T[A-Z]', match: false }
        },
        // Enums: PascalCase for name
        {
            selector: 'enum',
            format: ['PascalCase']
        },
        // Enum members: UPPER_CASE
        {
            selector: 'enumMember',
            format: ['UPPER_CASE']
        },
        // Class members: camelCase
        {
            selector: 'classProperty',
            format: ['camelCase'],
            leadingUnderscore: 'allow'
        },
        {
            selector: 'classMethod',
            format: ['camelCase'],
            leadingUnderscore: 'allow'
        }
    ]
};
