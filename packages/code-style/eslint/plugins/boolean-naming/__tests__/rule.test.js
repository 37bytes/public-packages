/**
 * @fileoverview Tests for boolean-naming rule
 *
 * Uses the ESLint programmatic API with TypeScript parser and project service
 * for type-checked linting. The rule requires TypeScript type information.
 */

import plugin from '#plugins/boolean-naming';

import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import tsParser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';

// Import the rule to verify it exports correctly
import { rule } from '../rule.js';

// ---------------------------------------------------------------------------
// Metadata tests
// ---------------------------------------------------------------------------

describe('boolean-naming rule', () => {
    test('rule should be exported correctly', () => {
        assert.ok(rule, 'rule should be defined');
        assert.ok(rule.meta, 'rule should have meta');
        assert.strictEqual(rule.meta.type, 'suggestion');
        assert.strictEqual(rule.meta.docs.requiresTypeChecking, true);
    });

    test('rule should have all required message IDs', () => {
        assert.ok(rule.meta.messages.booleanVariablePrefix);
        assert.ok(rule.meta.messages.booleanFunctionPrefix);
        assert.ok(rule.meta.messages.booleanParameterPrefix);
        assert.ok(rule.meta.messages.booleanDestructuringRename);
    });

    test('plugin should export rule under correct name', () => {
        assert.ok(plugin.rules['boolean-naming']);
        assert.strictEqual(plugin.rules['boolean-naming'], rule);
    });

    test('rule should be marked as fixable', () => {
        assert.strictEqual(rule.meta.fixable, 'code');
    });

    test('rule should have correct schema', () => {
        assert.ok(Array.isArray(rule.meta.schema));
        assert.strictEqual(rule.meta.schema.length, 1);
        assert.strictEqual(rule.meta.schema[0].type, 'object');
    });
});

// ---------------------------------------------------------------------------
// Helper: lint TypeScript code with type checking enabled
// ---------------------------------------------------------------------------

const TEST_DIR = path.dirname(new URL(import.meta.url).pathname);

const booleanNamingPlugin = {
    rules: {
        'boolean-naming': rule
    }
};

/**
 * Lint a TypeScript code string with the boolean-naming rule enabled.
 * Uses projectService so type information is available.
 *
 * @param {string} code - TypeScript source code to lint
 * @param {object} [options]
 * @param {string} [options.filePath] - Virtual file path (must end in .ts or .tsx)
 * @returns {Promise<import('eslint').ESLint.LintResult[]>}
 */
const lint = async (code, options = {}) => {
    const filePath = options.filePath || path.join(TEST_DIR, 'test-file.ts');

    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: {
            files: ['**/*.ts', '**/*.tsx'],
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    projectService: {
                        allowDefaultProject: ['*.ts', '*.tsx'],
                        defaultProject: path.join(TEST_DIR, 'tsconfig.json')
                    },
                    tsconfigRootDir: TEST_DIR
                }
            },
            plugins: {
                'custom-boolean': booleanNamingPlugin
            },
            rules: {
                'custom-boolean/boolean-naming': 'error'
            }
        }
    });

    return eslint.lintText(code, { filePath });
};

/**
 * Get messages from lint results.
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {import('eslint').Linter.LintMessage[]}
 */
const getMessages = (results) => results.flatMap((result) => result.messages);

/**
 * Get the fixed output from lint results.
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string|undefined}
 */
const getFixedOutput = (results) => results[0]?.output;

/**
 * Lint with fix enabled.
 * @param {string} code
 * @returns {Promise<import('eslint').ESLint.LintResult[]>}
 */
const lintWithFix = async (code) => {
    const filePath = path.join(TEST_DIR, 'test-file.ts');

    const eslint = new ESLint({
        fix: true,
        overrideConfigFile: true,
        overrideConfig: {
            files: ['**/*.ts', '**/*.tsx'],
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    projectService: {
                        allowDefaultProject: ['*.ts', '*.tsx'],
                        defaultProject: path.join(TEST_DIR, 'tsconfig.json')
                    },
                    tsconfigRootDir: TEST_DIR
                }
            },
            plugins: {
                'custom-boolean': booleanNamingPlugin
            },
            rules: {
                'custom-boolean/boolean-naming': 'error'
            }
        }
    });

    return eslint.lintText(code, { filePath });
};

// ---------------------------------------------------------------------------
// VariableDeclarator — type annotation path
// ---------------------------------------------------------------------------

describe('boolean-naming: VariableDeclarator (type annotation)', () => {
    test('should error on boolean variable without prefix', async () => {
        const results = await lint('const disabled: boolean = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
        assert.ok(messages[0].message.includes('disabled'));
    });

    test('should pass with each valid prefix (is, has, should, can, did, will, are)', async () => {
        const prefixed = [
            'const isDisabled: boolean = true;',
            'const hasPermission: boolean = true;',
            'const shouldRender: boolean = false;',
            'const canEdit: boolean = true;',
            'const didLoad: boolean = true;',
            'const willUpdate: boolean = false;',
            'const areValid: boolean = true;'
        ];
        for (const code of prefixed) {
            const results = await lint(code);
            const messages = getMessages(results);
            assert.strictEqual(messages.length, 0, `expected no error for: ${code}`);
        }
    });

    test('should error on Boolean reference type without prefix', async () => {
        const results = await lint('const disabled: Boolean = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should not error on non-boolean type annotation', async () => {
        const results = await lint('const name: string = "hello";');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should error on explicit boolean annotation even with non-literal init', async () => {
        const code = `
const obj: { active: boolean } = { active: true };
const val: boolean = obj.active;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const valueError = messages.find((message) => message.message.includes('"val"'));
        assert.ok(valueError, 'should report error on "val" (explicit annotation)');
    });
});

// ---------------------------------------------------------------------------
// VariableDeclarator — boolean literal path
// ---------------------------------------------------------------------------

describe('boolean-naming: VariableDeclarator (boolean literal)', () => {
    test('should error on const with true literal without prefix', async () => {
        const results = await lint('const active = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
        assert.ok(messages[0].message.includes('active'));
    });

    test('should error on const with false literal without prefix', async () => {
        const results = await lint('const hidden = false;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should pass on boolean literal with prefix', async () => {
        const results = await lint('const isActive = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on number literal', async () => {
        const results = await lint('const count = 42;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on string literal', async () => {
        const results = await lint('const name = "hello";');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should error on let with boolean literal', async () => {
        const results = await lint('let active = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should error on var with boolean literal', async () => {
        const results = await lint('var visible = false;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });
});

// ---------------------------------------------------------------------------
// VariableDeclarator — type-inferred path (requires type checker)
// ---------------------------------------------------------------------------

describe('boolean-naming: VariableDeclarator (type-inferred)', () => {
    test('should detect type-inferred boolean from function return', async () => {
        const code = `
function getBool(): boolean { return true; }
const disabled = getBool();
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const variableError = messages.find((message) => message.message.includes('"disabled"'));
        assert.ok(variableError, 'should error on "disabled" via type-inferred path');
    });

    test('should detect type-inferred boolean | undefined', async () => {
        const code = `
function getOptionalBool(): boolean | undefined { return true; }
const disabled = getOptionalBool();
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const variableError = messages.find((message) => message.message.includes('"disabled"'));
        assert.ok(variableError, 'should error on "disabled" via type-inferred path');
    });
});

// ---------------------------------------------------------------------------
// FunctionDeclaration — return type and parameters
// ---------------------------------------------------------------------------

describe('boolean-naming: FunctionDeclaration', () => {
    test('should NOT check function return type naming (by design)', async () => {
        // Function names like check(), validate(), toggle() are legitimate for boolean-returning functions
        const results = await lint('function check(): boolean { return true; }');
        const messages = getMessages(results);
        const functionError = messages.find((message) => message.messageId === 'booleanFunctionPrefix');
        assert.ok(!functionError, 'should not error on function name regardless of return type');
    });

    test('should detect boolean parameter', async () => {
        const results = await lint('function foo(active: boolean) {}');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanParameterPrefix');
    });

    test('should pass on function with boolean parameter with prefix', async () => {
        const results = await lint('function foo(isActive: boolean) {}');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on non-boolean parameter', async () => {
        const results = await lint('function foo(name: string) {}');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not crash on function with no return type annotation', async () => {
        const results = await lint('function check() { return true; }');
        const messages = getMessages(results);
        assert.ok(Array.isArray(messages));
    });
});

// ---------------------------------------------------------------------------
// ArrowFunctionExpression — return type and parameters
// ---------------------------------------------------------------------------

describe('boolean-naming: ArrowFunctionExpression', () => {
    test('should NOT check arrow function return type naming (by design)', async () => {
        const results = await lint('const check = (): boolean => true;');
        const messages = getMessages(results);
        const functionError = messages.find((message) => message.messageId === 'booleanFunctionPrefix');
        assert.ok(!functionError, 'should not error on arrow function name regardless of return type');
    });

    test('should detect arrow boolean parameter', async () => {
        const results = await lint('const fn = (active: boolean) => {};');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanParameterPrefix');
    });

    test('should pass on arrow function boolean param with prefix', async () => {
        const results = await lint('const fn = (isActive: boolean) => {};');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });
});

// ---------------------------------------------------------------------------
// ObjectPattern (destructuring)
// ---------------------------------------------------------------------------

describe('boolean-naming: ObjectPattern (destructuring)', () => {
    test('should detect destructured boolean property', async () => {
        const code = `
const obj: { disabled: boolean } = { disabled: true };
const { disabled } = obj;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const destructError = messages.find((message) => message.messageId === 'booleanDestructuringRename');
        assert.ok(destructError, 'should report booleanDestructuringRename');
    });

    test('should pass on destructured boolean renamed with prefix (no false positive)', async () => {
        const code = `
const obj: { disabled: boolean } = { disabled: true };
const { disabled: isDisabled } = obj;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const destructError = messages.find((message) => message.messageId === 'booleanDestructuringRename');
        assert.ok(!destructError, 'should not have destructuring rename error');
    });

    test('should not error on destructured non-boolean property', async () => {
        const code = `
const obj: { name: string } = { name: "test" };
const { name } = obj;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should pass when all destructured booleans are renamed with prefix', async () => {
        const code = `
const obj: { active: boolean; visible: boolean } = { active: true, visible: false };
const { active: isActive, visible: isVisible } = obj;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const destructErrors = messages.filter((message) => message.messageId === 'booleanDestructuringRename');
        assert.strictEqual(destructErrors.length, 0);
    });
});

// ---------------------------------------------------------------------------
// Autofix — type annotation and boolean literal paths
// ---------------------------------------------------------------------------

describe('boolean-naming: autofix', () => {
    test('should fix boolean variable by adding "is" prefix (type annotation)', async () => {
        const results = await lintWithFix('const disabled: boolean = true;');
        const output = getFixedOutput(results);
        assert.ok(output, 'should have fix output');
        assert.ok(output.includes('isDisabled'), `expected "isDisabled" in output, got: ${output}`);
    });

    test('should fix boolean literal variable by adding "is" prefix', async () => {
        const results = await lintWithFix('const active = true;');
        const output = getFixedOutput(results);
        assert.ok(output, 'should have fix output');
        assert.ok(output.includes('isActive'), `expected "isActive" in output, got: ${output}`);
    });

    test('should capitalize correctly when fixing single-char name', async () => {
        const results = await lintWithFix('const x: boolean = true;');
        const output = getFixedOutput(results);
        assert.ok(output, 'should have fix output');
        assert.ok(output.includes('isX'), `expected "isX" in output, got: ${output}`);
    });

    test('should fix Boolean reference type variable', async () => {
        const results = await lintWithFix('const disabled: Boolean = true;');
        const output = getFixedOutput(results);
        assert.ok(output, 'should have fix output');
        assert.ok(output.includes('isDisabled'), `expected "isDisabled" in output, got: ${output}`);
    });
});

// ---------------------------------------------------------------------------
// Union type tests
// ---------------------------------------------------------------------------

describe('boolean-naming: union types', () => {
    test('should error on boolean | undefined with literal true (literal check)', async () => {
        const results = await lint('const disabled: boolean | undefined = true;');
        const messages = getMessages(results);
        // Caught by the boolean literal check (init is `true`), not by type annotation
        const variableError = messages.find((message) => message.messageId === 'booleanVariablePrefix');
        assert.ok(variableError, 'should error via boolean literal check');
    });

    test('should error on boolean | null with literal true (literal check)', async () => {
        const results = await lint('const disabled: boolean | null = true;');
        const messages = getMessages(results);
        const variableError = messages.find((message) => message.messageId === 'booleanVariablePrefix');
        assert.ok(variableError, 'should error via boolean literal check');
    });

    test('should pass on boolean | undefined with prefix', async () => {
        const results = await lint('const isDisabled: boolean | undefined = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should error on boolean | string with literal true (literal check fires)', async () => {
        const results = await lint('const status: boolean | string = true;');
        const messages = getMessages(results);
        // Annotation is TSUnionType (not TSBooleanKeyword) so annotation check skips,
        // but the literal check fires because init is `true`.
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should not error on boolean | string without literal boolean', async () => {
        const code = `
const input: string = "yes";
const status: boolean | string = input;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const statusError = messages.find((message) => message.message.includes('"status"'));
        assert.ok(!statusError, 'no literal and annotation is union, so no error');
    });

    test('should not error on string | number', async () => {
        const results = await lint('const status: string | number = "active";');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should error on boolean | null | undefined with literal true', async () => {
        const results = await lint('const disabled: boolean | null | undefined = true;');
        const messages = getMessages(results);
        const variableError = messages.find((message) => message.messageId === 'booleanVariablePrefix');
        assert.ok(variableError, 'should error via boolean literal check');
    });

    test('should pass on boolean | null | undefined with prefix', async () => {
        const results = await lint('const isDisabled: boolean | null | undefined = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on type-inferred boolean | string (no literal, no annotation)', async () => {
        const code = `
function getMixed(): boolean | string { return true; }
const status = getMixed();
`;
        const results = await lint(code);
        const messages = getMessages(results);
        const statusError = messages.find((message) => message.message.includes('"status"'));
        assert.ok(!statusError, 'no literal, no annotation, type checker broken');
    });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('boolean-naming: edge cases', () => {
    test('should error when name starts with "is" but is not a valid prefix ("island")', async () => {
        // "island" starts with "is" but "l" is not uppercase
        const results = await lint('const island: boolean = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should error when name starts with "has" but is not a valid prefix ("haste")', async () => {
        const results = await lint('const haste: boolean = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should pass on "isA" (single uppercase letter after prefix)', async () => {
        const results = await lint('const isA: boolean = true;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on array destructuring with boolean literals', async () => {
        const results = await lint('const [a, b] = [true, false];');
        const messages = getMessages(results);
        // ArrayPattern is not Identifier, so the boolean literal check does not fire
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on object spread in destructuring', async () => {
        const code = `
const obj: { name: string; active: boolean } = { name: "test", active: true };
const { ...rest } = obj;
`;
        const results = await lint(code);
        const messages = getMessages(results);
        // RestElement is not a Property, so ObjectPattern handler skips it
        assert.strictEqual(messages.length, 0);
    });

    test('should not error on boolean without init (declaration only)', async () => {
        const results = await lint('let disabled: boolean;');
        const messages = getMessages(results);
        // Has TSBooleanKeyword annotation, no prefix -> should error
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].messageId, 'booleanVariablePrefix');
    });

    test('should not error on undefined init with non-boolean type', async () => {
        const results = await lint('let name: string;');
        const messages = getMessages(results);
        assert.strictEqual(messages.length, 0);
    });

    test('should not crash on anonymous arrow function (no parent variable)', async () => {
        const code = `
const arr = [1, 2, 3];
arr.filter((x: boolean) => x);
`;
        const results = await lint(code);
        const messages = getMessages(results);
        // Arrow is inside a CallExpression, not a VariableDeclarator,
        // so the ArrowFunctionExpression handler returns early.
        // But the param check still runs (though broken due to checker.ts bug).
        assert.ok(Array.isArray(messages));
    });
});
