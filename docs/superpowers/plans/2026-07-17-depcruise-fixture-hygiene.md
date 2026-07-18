# Depcruise Fixture Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both dependency-cruiser fixture projects pass a reusable ESLint and TypeScript hygiene gate while preserving their exact graph behavior.

**Architecture:** Add an internal `fixture-hygiene.js` module that composes ESLint correctness and naming rules, discovers fixture files, and collects normalized TypeScript diagnostics. A dedicated Node test applies that helper to the base and FSD fixture projects. FSD graph edges become side-effect imports so the fixture remains a valid TypeScript project without fake exports or unused bindings.

**Tech Stack:** Node.js 24 test runner, ESLint 10 flat config, `@eslint/js`, `@typescript-eslint/eslint-plugin`, TypeScript 6 Compiler API, dependency-cruiser 17.

## Global Constraints

- Scope is limited to `cruise-base-project`, `fsd-cruise-project`, the new internal hygiene helper, and their focused tests.
- `fixture-hygiene.js` stays internal and is not added to package exports.
- Keep `packages/code-style/eslint.config.js` fixture ignore unchanged.
- ESLint baseline is `@eslint/js` recommended plus `@typescript-eslint/eslint-plugin` `flat/recommended-type-checked` and the existing package naming policy.
- Reuse `id-length`, `@typescript-eslint/naming-convention`, `@37bytes/boolean-naming`, and `@37bytes/enum-pattern` from their current source objects. Do not copy their options.
- Any ESLint warning or error fails hygiene.
- FSD TypeScript diagnostics must be empty.
- Base TypeScript diagnostics must contain exactly the intentional `TS2882` for the side-effect import in `src/unresolvable.ts:1` and `./missing`.
- Express graph-only dependencies with side-effect imports. Do not add fake exports, dependency arrays, or values used only to satisfy lint.
- Do not add inline ESLint disables to fixture files or add `ignoreDeprecations`. The test helper may carry the single documented filesystem-security suppression shown in Task 2.
- Preserve the existing FSD matrix of 16 dependency-cruiser violations.
- Preserve the base cycle, orphan, and unresolved violations.
- Do not modify or commit unrelated staged or unstaged files.

---

### Task 1: Finish the base cycle fixture rename

**Files:**
- Modify: `packages/code-style/__tests__/dependency-cruiser-base.test.js:84-92`
- Include existing rename: `packages/code-style/__tests__/fixtures/cruise-base-project/src/a.ts` to `packages/code-style/__tests__/fixtures/cruise-base-project/src/first.ts`
- Include existing rename: `packages/code-style/__tests__/fixtures/cruise-base-project/src/b.ts` to `packages/code-style/__tests__/fixtures/cruise-base-project/src/second.ts`

**Interfaces:**
- Consumes: existing `violationSet(cruiseResult)` output format.
- Produces: a green base depcruise behavior test whose expected paths match the renamed fixture files.

- [ ] **Step 1: Reproduce the stale-path failure**

Run:

```bash
cd packages/code-style
pnpm exec node --test __tests__/dependency-cruiser-base.test.js
```

Expected: FAIL. The actual cycle is `src/first.ts -> src/second.ts`, while the test expects `src/a.ts -> src/b.ts`.

- [ ] **Step 2: Update the expected cycle and its explanation**

Replace the behavior assertion with:

```js
test('ловит цикл, orphan и unresolvable; ничего лишнего', async () => {
    const result = await runDepcruise(FIXTURE_ROOT);
    // depcruise reports circular cycles once per cycle entry-point, not once per edge;
    // the first->second->first cycle appears as one violation from first.ts to second.ts
    assert.deepStrictEqual(violationSet(result), [
        'no-circular: src/first.ts -> src/second.ts',
        'no-orphans: src/orphan.ts -> src/orphan.ts',
        'not-to-unresolvable: src/unresolvable.ts -> ./missing'
    ]);
});
```

- [ ] **Step 3: Verify the focused test is green**

Run:

```bash
pnpm exec node --test __tests__/dependency-cruiser-base.test.js
```

Expected: all 7 tests pass, including the behavior fixture.

- [ ] **Step 4: Commit only the base rename and expectation**

Review the staged rename before committing. Then run:

```bash
git add -A \
  packages/code-style/__tests__/dependency-cruiser-base.test.js \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/a.ts \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/b.ts \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/first.ts \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/second.ts
git commit --only \
  packages/code-style/__tests__/dependency-cruiser-base.test.js \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/a.ts \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/b.ts \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/first.ts \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/second.ts \
  -m "test(code-style): clarify base cruise cycle fixture"
```

Expected: the commit contains only the base test and cycle fixture rename. Normal commit hooks should pass after the stale expectation is fixed.

---

### Task 2: Add the reusable hygiene helper and base contracts

**Files:**
- Create: `packages/code-style/__tests__/fixture-hygiene.js`
- Create: `packages/code-style/__tests__/dependency-cruiser-fixtures-hygiene.test.js`
- Modify: `packages/code-style/__tests__/fixtures/cruise-base-project/src/unresolvable.ts`

**Interfaces:**
- Produces: `collectFixtureSourceFiles(fixtureRoot): Promise<string[]>` returning sorted relative source paths.
- Produces: `createFixtureHygieneConfig(fixtureRoot): import('eslint').Linter.Config[]`.
- Produces: `lintFixtureProject(fixtureRoot): Promise<{ discoveredFiles: string[], lintedFiles: string[], diagnostics: object[] }>`.
- Produces: `inspectTypeScriptFixture(fixtureRoot): { rootFiles: string[], diagnostics: NormalizedDiagnostic[] }`.
- `NormalizedDiagnostic`: `{ code: number, filePath: string | null, line: number | null, column: number | null, message: string }`.

- [ ] **Step 1: Plan the base tests with `test.todo`**

Create `dependency-cruiser-fixtures-hygiene.test.js` with imports, roots, and these exact todo cases:

```js
import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

import { javascript } from '../eslint/rules/javascript.js';
import { typescript } from '../eslint/rules/typescript.js';

const BASE_FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'cruise-base-project');

const loadHygiene = () => import('./fixture-hygiene.js');

describe('dependency-cruiser fixture hygiene: reusable config', () => {
    test.todo('should reuse the complete package naming policy when TypeScript files are linted: catches a silently weakened fixture preset');
});

describe('dependency-cruiser fixture hygiene: base fixture', () => {
    test.todo('should lint every discovered source file when the base fixture is checked: catches files silently omitted from ESLint');
    test.todo('should report zero ESLint diagnostics when the base fixture is checked: catches accidental JavaScript or TypeScript lint defects');
    test.todo('should include every discovered source file when the base TypeScript program is built: catches files silently omitted by tsconfig');
    test.todo('should report only the intentional unresolved import when the base TypeScript program is checked: catches accidental TypeScript defects or loss of the unresolved edge');
});
```

- [ ] **Step 2: Run the todo-only file**

Run:

```bash
pnpm exec node --test __tests__/dependency-cruiser-fixtures-hygiene.test.js
```

Expected: five todo tests, no failures.

- [ ] **Step 3: QA-review the todo plan**

Dispatch a fresh test-review subagent. Its prompt must require `skill=unit-test`, instruct it to review only the five `test.todo` names against the unit-test Never list, and return `line N: <rule> - <quote>` violations only. Fix every reported naming or scope problem before proceeding.

- [ ] **Step 4: Implement the naming-policy contract first**

Replace the reusable-config todo with:

```js
test('should reuse the complete package naming policy when TypeScript files are linted: catches a silently weakened fixture preset', async () => {
    const { createFixtureHygieneConfig } = await loadHygiene();
    const config = createFixtureHygieneConfig(BASE_FIXTURE_ROOT);
    const identifierLengthConfig = config.find(
        (entry) => entry.name === '@37bytes/fixture-hygiene/identifier-length'
    );
    const typeScriptNamingConfig = config.find(
        (entry) => entry.name === '@37bytes/fixture-hygiene/typescript-naming'
    );

    assert.deepStrictEqual(identifierLengthConfig.rules['id-length'], javascript['id-length']);
    assert.deepStrictEqual(
        typeScriptNamingConfig.rules['@typescript-eslint/naming-convention'],
        typescript['@typescript-eslint/naming-convention']
    );
    assert.strictEqual(typeScriptNamingConfig.rules['@37bytes/boolean-naming'], 'error');
    assert.strictEqual(typeScriptNamingConfig.rules['@37bytes/enum-pattern'], 'error');
});
```

Run:

```bash
pnpm exec node --test __tests__/dependency-cruiser-fixtures-hygiene.test.js
```

Expected: FAIL inside the test with `ERR_MODULE_NOT_FOUND` for `fixture-hygiene.js`.

- [ ] **Step 5: Implement only the config required by the naming test**

Create `fixture-hygiene.js`:

```js
import path from 'node:path';

import eslintJavaScript from '@eslint/js';
import typeScriptEslintPlugin from '@typescript-eslint/eslint-plugin';

import { plugins } from '../eslint/plugins/index.js';
import { javascript } from '../eslint/rules/javascript.js';
import { typescript } from '../eslint/rules/typescript.js';

const SOURCE_FILE_PATTERNS = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];
const TYPESCRIPT_FILE_PATTERNS = ['**/*.ts', '**/*.tsx'];

export const createFixtureHygieneConfig = (fixtureRoot) => {
    const typeCheckedConfigs = typeScriptEslintPlugin.configs['flat/recommended-type-checked'].map((config) => ({
        ...config,
        files: TYPESCRIPT_FILE_PATTERNS
    }));

    return [
        {
            ...eslintJavaScript.configs.recommended,
            name: '@37bytes/fixture-hygiene/javascript-recommended'
        },
        {
            name: '@37bytes/fixture-hygiene/javascript-jsx',
            files: ['**/*.jsx'],
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: { jsx: true }
                }
            }
        },
        ...typeCheckedConfigs,
        {
            name: '@37bytes/fixture-hygiene/typescript-project',
            files: TYPESCRIPT_FILE_PATTERNS,
            languageOptions: {
                parserOptions: {
                    project: path.join(fixtureRoot, 'tsconfig.json'),
                    tsconfigRootDir: fixtureRoot
                }
            }
        },
        {
            name: '@37bytes/fixture-hygiene/identifier-length',
            files: SOURCE_FILE_PATTERNS,
            rules: {
                'id-length': javascript['id-length']
            }
        },
        {
            name: '@37bytes/fixture-hygiene/typescript-naming',
            files: TYPESCRIPT_FILE_PATTERNS,
            plugins: {
                '@37bytes': plugins
            },
            rules: {
                '@typescript-eslint/naming-convention': typescript['@typescript-eslint/naming-convention'],
                '@37bytes/boolean-naming': 'error',
                '@37bytes/enum-pattern': 'error'
            }
        },
        {
            name: '@37bytes/fixture-hygiene/no-inline-overrides',
            linterOptions: {
                noInlineConfig: true,
                reportUnusedDisableDirectives: 'error'
            }
        }
    ];
};
```

Run the single test file. Expected: the naming-policy test passes and four base tests remain todo.

- [ ] **Step 6: Implement the base ESLint diagnostic test and verify RED**

Replace its todo with:

```js
test('should report zero ESLint diagnostics when the base fixture is checked: catches accidental JavaScript or TypeScript lint defects', async () => {
    const { lintFixtureProject } = await loadHygiene();
    const result = await lintFixtureProject(BASE_FIXTURE_ROOT);

    assert.deepStrictEqual(result.diagnostics, []);
});
```

Run the single test file. Expected: FAIL because `lintFixtureProject` is not exported.

- [ ] **Step 7: Add the minimal ESLint runner**

Add these imports to `fixture-hygiene.js`:

```js
import { readdir } from 'node:fs/promises';
import { ESLint } from 'eslint';
```

Add after the file-pattern constants:

```js
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const toRelativePath = (fixtureRoot, filePath) => path.relative(fixtureRoot, filePath).split(path.sep).join('/');

const collectAbsoluteFixtureSourceFiles = async (fixtureRoot) => {
    const sourceRoot = path.join(fixtureRoot, 'src');
    const pendingDirectories = [sourceRoot];
    const sourceFiles = [];

    while (pendingDirectories.length > 0) {
        const directory = pendingDirectories.pop();
        // directory descends from a test-owned fixture root, never user input
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const entries = await readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                pendingDirectories.push(entryPath);
            } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
                sourceFiles.push(entryPath);
            }
        }
    }

    if (sourceFiles.length === 0) {
        throw new Error(`Fixture source set is empty: ${fixtureRoot}`);
    }

    return sourceFiles.toSorted();
};
```

Add after `createFixtureHygieneConfig`:

```js
export const lintFixtureProject = async (fixtureRoot) => {
    const absoluteFiles = await collectAbsoluteFixtureSourceFiles(fixtureRoot);
    const eslint = new ESLint({
        cwd: fixtureRoot,
        overrideConfigFile: true,
        overrideConfig: createFixtureHygieneConfig(fixtureRoot)
    });
    const results = await eslint.lintFiles(absoluteFiles);

    return {
        diagnostics: results.flatMap((result) =>
            result.messages.map((message) => ({
                filePath: toRelativePath(fixtureRoot, result.filePath),
                line: message.line,
                column: message.column,
                ruleId: message.ruleId,
                severity: message.severity,
                message: message.message
            }))
        )
    };
};
```

Run the single test file. Expected: FAIL with `@typescript-eslint/no-unsafe-assignment` in `src/unresolvable.ts`; the unresolved named import produces an error-typed value.

- [ ] **Step 8: Convert the base unresolved edge to a side-effect import**

Replace `src/unresolvable.ts` with:

```ts
import './missing';

export {};
```

Run the single test file. Expected: the base ESLint diagnostic test passes. The depcruise edge remains `src/unresolvable.ts -> ./missing`.

- [ ] **Step 9: Implement the base ESLint inventory test and verify RED**

Replace its todo with:

```js
test('should lint every discovered source file when the base fixture is checked: catches files silently omitted from ESLint', async () => {
    const { lintFixtureProject } = await loadHygiene();
    const result = await lintFixtureProject(BASE_FIXTURE_ROOT);

    assert.ok(Array.isArray(result.discoveredFiles));
    assert.ok(Array.isArray(result.lintedFiles));
    assert.ok(result.discoveredFiles.length > 0);
    assert.deepStrictEqual(result.lintedFiles, result.discoveredFiles);
});
```

Run the single test file. Expected: FAIL because the result does not yet expose `lintedFiles` and `discoveredFiles`.

- [ ] **Step 10: Expose discovered and linted file sets**

Add:

```js
export const collectFixtureSourceFiles = async (fixtureRoot) =>
    (await collectAbsoluteFixtureSourceFiles(fixtureRoot))
        .map((filePath) => toRelativePath(fixtureRoot, filePath))
        .toSorted();
```

Update `lintFixtureProject` to calculate `discoveredFiles` from `absoluteFiles` and return:

```js
return {
    discoveredFiles: absoluteFiles.map((filePath) => toRelativePath(fixtureRoot, filePath)).toSorted(),
    lintedFiles: results.map((result) => toRelativePath(fixtureRoot, result.filePath)).toSorted(),
    diagnostics: results.flatMap((result) =>
        result.messages.map((message) => ({
            filePath: toRelativePath(fixtureRoot, result.filePath),
            line: message.line,
            column: message.column,
            ruleId: message.ruleId,
            severity: message.severity,
            message: message.message
        }))
    )
};
```

Run the single test file. Expected: both base ESLint tests pass.

- [ ] **Step 11: Implement the exact base TypeScript diagnostic test and verify RED**

Replace its todo with:

```js
test('should report only the intentional unresolved import when the base TypeScript program is checked: catches accidental TypeScript defects or loss of the unresolved edge', async () => {
    const { inspectTypeScriptFixture } = await loadHygiene();
    const result = inspectTypeScriptFixture(BASE_FIXTURE_ROOT);

    assert.deepStrictEqual(result.diagnostics, [
        {
            code: 2882,
            filePath: 'src/unresolvable.ts',
            line: 1,
            column: 8,
            message: "Cannot find module or type declarations for side-effect import of './missing'."
        }
    ]);
});
```

Run the single test file. Expected: FAIL because `inspectTypeScriptFixture` is not exported.

- [ ] **Step 12: Add TypeScript diagnostic collection**

Add `import typeScript from 'typescript';` to the external import group. Add:

```js
const normalizeTypeScriptDiagnostic = (fixtureRoot, diagnostic) => {
    let filePath = null;
    let line = null;
    let column = null;

    if (diagnostic.file && diagnostic.start !== undefined) {
        const location = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        filePath = toRelativePath(fixtureRoot, diagnostic.file.fileName);
        line = location.line + 1;
        column = location.character + 1;
    }

    return {
        code: diagnostic.code,
        filePath,
        line,
        column,
        message: typeScript.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    };
};

export const inspectTypeScriptFixture = (fixtureRoot) => {
    const tsconfigPath = path.join(fixtureRoot, 'tsconfig.json');
    const configFile = typeScript.readConfigFile(tsconfigPath, typeScript.sys.readFile);

    if (configFile.error) {
        return {
            diagnostics: [normalizeTypeScriptDiagnostic(fixtureRoot, configFile.error)]
        };
    }

    const parsedConfig = typeScript.parseJsonConfigFileContent(
        configFile.config,
        typeScript.sys,
        fixtureRoot,
        undefined,
        tsconfigPath
    );
    const program = typeScript.createProgram({
        rootNames: parsedConfig.fileNames,
        options: parsedConfig.options
    });
    const diagnostics = [
        ...parsedConfig.errors,
        ...program.getOptionsDiagnostics(),
        ...program.getSyntacticDiagnostics(),
        ...program.getSemanticDiagnostics()
    ];

    return {
        diagnostics: diagnostics.map((diagnostic) => normalizeTypeScriptDiagnostic(fixtureRoot, diagnostic))
    };
};
```

Run the single test file. Expected: the exact base `TS2882` test passes.

- [ ] **Step 13: Implement the base TypeScript inventory test and verify RED**

Replace its todo with:

```js
test('should include every discovered source file when the base TypeScript program is built: catches files silently omitted by tsconfig', async () => {
    const { collectFixtureSourceFiles, inspectTypeScriptFixture } = await loadHygiene();
    const discoveredFiles = await collectFixtureSourceFiles(BASE_FIXTURE_ROOT);
    const result = inspectTypeScriptFixture(BASE_FIXTURE_ROOT);

    assert.deepStrictEqual(result.rootFiles, discoveredFiles);
});
```

Run the single test file. Expected: FAIL because `inspectTypeScriptFixture` does not yet expose `rootFiles`.

- [ ] **Step 14: Expose TypeScript root files**

Update both branches of `inspectTypeScriptFixture`:

```js
if (configFile.error) {
    return {
        rootFiles: [],
        diagnostics: [normalizeTypeScriptDiagnostic(fixtureRoot, configFile.error)]
    };
}
```

Use this final successful return:

```js
return {
    rootFiles: program
        .getRootFileNames()
        .filter((filePath) => {
            const relativePath = path.relative(fixtureRoot, filePath);
            return relativePath !== '' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
        })
        .map((filePath) => toRelativePath(fixtureRoot, filePath))
        .toSorted(),
    diagnostics: diagnostics.map((diagnostic) => normalizeTypeScriptDiagnostic(fixtureRoot, diagnostic))
};
```

Run:

```bash
pnpm exec node --test __tests__/dependency-cruiser-fixtures-hygiene.test.js
```

Expected: five tests pass, no failures and no remaining base todos.

- [ ] **Step 15: Commit the reusable helper and base contracts**

```bash
git add \
  packages/code-style/__tests__/fixture-hygiene.js \
  packages/code-style/__tests__/dependency-cruiser-fixtures-hygiene.test.js \
  packages/code-style/__tests__/fixtures/cruise-base-project/src/unresolvable.ts
git commit -m "test(code-style): add reusable fixture hygiene"
```

Expected: normal hooks pass. If a hook reports unrelated user work, inspect the exact failure and staged paths before deciding how to proceed.

---

### Task 3: Make the FSD graph fixture hygienic

**Files:**
- Modify: `packages/code-style/__tests__/dependency-cruiser-fixtures-hygiene.test.js`
- Modify: `packages/code-style/__tests__/fixtures/fsd-cruise-project/tsconfig.json`
- Create: `packages/code-style/__tests__/fixtures/fsd-cruise-project/src/markers.d.ts`
- Modify graph imports in:
  - `src/app/index.ts`
  - `src/entities/user/index.ts`
  - `src/entities/user/api/getUser.ts`
  - `src/entities/user/model/types.ts`
  - `src/features/auth/api/login.ts`
  - `src/features/auth/model/store.ts`
  - `src/pages/home/components/Button.tsx`
  - `src/shared/lib/classNames/index.ts`
  - `src/widgets/header/api/getHeader.ts`
  - `src/widgets/header/ui/Header.tsx`

**Interfaces:**
- Consumes: all four helper functions from Task 2.
- Produces: zero ESLint and TypeScript diagnostics for FSD fixture while preserving the existing 16 depcruise violations.

- [ ] **Step 1: Add the FSD root and four test todos**

Add beside `BASE_FIXTURE_ROOT`:

```js
const FSD_FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'fsd-cruise-project');
```

Add:

```js
describe('dependency-cruiser fixture hygiene: FSD fixture', () => {
    test.todo('should lint every discovered source file when the FSD fixture is checked: catches files silently omitted from ESLint');
    test.todo('should report zero ESLint diagnostics when the FSD fixture is checked: catches accidental JavaScript or TypeScript lint defects');
    test.todo('should include every discovered source file when the FSD TypeScript program is built: catches files silently omitted by tsconfig');
    test.todo('should report zero TypeScript diagnostics when the FSD fixture is checked: catches missing modules, missing exports, and deprecated options');
});
```

- [ ] **Step 2: QA-review the new todo cases**

Dispatch the same unit-test QA review used in Task 2, scoped only to the four new todo lines. Fix every reported issue before adding bodies.

- [ ] **Step 3: Implement the FSD ESLint diagnostic test first and verify RED**

```js
test('should report zero ESLint diagnostics when the FSD fixture is checked: catches accidental JavaScript or TypeScript lint defects', async () => {
    const { lintFixtureProject } = await loadHygiene();
    const result = await lintFixtureProject(FSD_FIXTURE_ROOT);

    assert.deepStrictEqual(result.diagnostics, []);
});
```

Run the single test file. Expected: FAIL with unused imports and naming diagnostics from the current FSD fixture.

- [ ] **Step 4: Implement the FSD TypeScript diagnostic test and verify RED**

```js
test('should report zero TypeScript diagnostics when the FSD fixture is checked: catches missing modules, missing exports, and deprecated options', async () => {
    const { inspectTypeScriptFixture } = await loadHygiene();
    const result = inspectTypeScriptFixture(FSD_FIXTURE_ROOT);

    assert.deepStrictEqual(result.diagnostics, []);
});
```

Run the single test file. Expected: FAIL with the deprecated `baseUrl`, missing marker modules, and missing exported symbols.

- [ ] **Step 5: Convert named graph imports to side-effect imports**

Keep every module specifier and rule comment unchanged. Replace each file with the following final content.

`src/app/index.ts`:

```ts
import '@/pages/home'; // fsd: clean
import '@/features/auth'; // fsd: clean
import '@/features/auth/model/store'; // fsd: no-deep-into-slice-from-flat

export {};
```

`src/entities/user/index.ts`:

```ts
import './model/types'; // fsd: clean

export {};
```

`src/entities/user/api/getUser.ts`:

```ts
import '../model/types'; // fsd: clean

export {};
```

`src/entities/user/model/types.ts`:

```ts
import '@/features/auth'; // fsd: layers-entities-up
import '@/entities/session'; // fsd: no-cross-slice
import '@/shared/ui'; // fsd: clean
import '@/entities/user'; // fsd: no-slice-self-import

export {};
```

`src/features/auth/api/login.ts`:

```ts
import '../model/store'; // fsd: clean

export {};
```

`src/features/auth/model/store.ts`:

```ts
import '@/pages/home'; // fsd: layers-features-up
import '@/features/search'; // fsd: no-cross-slice
import '@/entities/user'; // fsd: clean
import '@/entities/user/model/types'; // fsd: no-deep-into-slice-from-slice
import '@/shared/lib/classNames'; // fsd: clean
import '@/shared/lib/classNames/utils'; // fsd: no-deep-into-shared
import '@/shared/ui/Button'; // fsd: no-deep-into-shared
import '@/shared/ui'; // fsd: clean
import '@/shared/api/base'; // fsd: clean
import '@/shared/config/theme'; // fsd: no-deep-into-shared
import '@/entities/user/@x'; // fsd: clean
import '@/entities/user/@x/session'; // fsd: clean

export {};
```

`src/pages/home/components/Button.tsx`:

```tsx
import '@/pages/home/components/icon/Icon'; // fsd: clean

export {};
```

`src/shared/lib/classNames/index.ts`:

```ts
import '@/entities/user'; // fsd: layers-shared-up

export {};
```

`src/widgets/header/api/getHeader.ts`:

```ts
import '../ui/Header'; // fsd: no-cross-segment

export {};
```

`src/widgets/header/ui/Header.tsx`:

```tsx
import '@/pages/home'; // fsd: layers-widgets-up

export {};
```

- [ ] **Step 6: Add marker module declarations**

Create `src/markers.d.ts`:

```ts
declare module 'client-only';
declare module 'server-only';
```

This file has no imports and therefore adds no dependency-cruiser edges.

- [ ] **Step 7: Remove the deprecated TypeScript option**

Change `fsd-cruise-project/tsconfig.json` to:

```json
{
    "compilerOptions": {
        "paths": { "@/*": ["./src/*"] },
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "jsx": "react-jsx"
    },
    "include": ["src"]
}
```

Do not add `ignoreDeprecations`.

- [ ] **Step 8: Verify the two red contracts turn green**

Run:

```bash
pnpm exec node --test __tests__/dependency-cruiser-fixtures-hygiene.test.js
```

Expected: the implemented FSD diagnostics tests pass. Two FSD inventory todos remain.

- [ ] **Step 9: Implement the FSD ESLint inventory contract**

```js
test('should lint every discovered source file when the FSD fixture is checked: catches files silently omitted from ESLint', async () => {
    const { lintFixtureProject } = await loadHygiene();
    const result = await lintFixtureProject(FSD_FIXTURE_ROOT);

    assert.ok(Array.isArray(result.discoveredFiles));
    assert.ok(Array.isArray(result.lintedFiles));
    assert.ok(result.discoveredFiles.length > 0);
    assert.deepStrictEqual(result.lintedFiles, result.discoveredFiles);
});
```

Run the single test file. Expected: PASS.

- [ ] **Step 10: Implement the FSD TypeScript inventory contract**

```js
test('should include every discovered source file when the FSD TypeScript program is built: catches files silently omitted by tsconfig', async () => {
    const { collectFixtureSourceFiles, inspectTypeScriptFixture } = await loadHygiene();
    const discoveredFiles = await collectFixtureSourceFiles(FSD_FIXTURE_ROOT);
    const result = inspectTypeScriptFixture(FSD_FIXTURE_ROOT);

    assert.deepStrictEqual(result.rootFiles, discoveredFiles);
});
```

Run the single test file. Expected: all 11 hygiene tests pass with zero todos.

- [ ] **Step 11: Verify graph behavior is unchanged**

Run:

```bash
pnpm exec node --test __tests__/dependency-cruiser-fsd.test.js
```

Expected: all 6 tests pass and the behavior test still reports exactly the existing 16 violations.

- [ ] **Step 12: Commit the hygienic FSD fixture**

```bash
git add \
  packages/code-style/__tests__/dependency-cruiser-fixtures-hygiene.test.js \
  packages/code-style/__tests__/fixtures/fsd-cruise-project/tsconfig.json \
  packages/code-style/__tests__/fixtures/fsd-cruise-project/src
git commit -m "test(code-style): harden depcruise fixtures"
```

Expected: the commit contains only the FSD fixture cleanup and completed hygiene tests.

---

### Task 4: Run final focused and package verification

**Files:**
- Verify only. No planned source changes.

**Interfaces:**
- Consumes: completed tasks 1 through 3.
- Produces: evidence that hygiene, graph behavior, fixture-backed ESLint behavior, formatting, and the package suite all remain correct.

- [ ] **Step 1: Run the new hygiene suite**

```bash
cd packages/code-style
pnpm exec node --test __tests__/dependency-cruiser-fixtures-hygiene.test.js
```

Expected: 11 tests pass, 0 fail, 0 todo.

- [ ] **Step 2: Run both depcruise behavior suites together**

```bash
pnpm exec node --test \
  __tests__/dependency-cruiser-base.test.js \
  __tests__/dependency-cruiser-fsd.test.js
```

Expected: 13 tests pass. Base reports the renamed cycle; FSD preserves the 16-violation matrix.

- [ ] **Step 3: Run fixture-backed ESLint and FSD tests**

```bash
pnpm exec node --test \
  __tests__/fixtures.test.js \
  __tests__/fsd-e2e.test.js
```

Expected: all focused tests pass with no warnings or failures.

- [ ] **Step 4: Lint only the new test infrastructure**

```bash
pnpm exec eslint --max-warnings 0 \
  __tests__/fixture-hygiene.js \
  __tests__/dependency-cruiser-fixtures-hygiene.test.js
```

Expected: exit code 0 and no diagnostics. Do not run the package `lint:eslint` script here because it uses `--fix` across unrelated user work.

- [ ] **Step 5: Check formatting of every touched file**

```bash
pnpm exec prettier --check \
  __tests__/fixture-hygiene.js \
  __tests__/dependency-cruiser-fixtures-hygiene.test.js \
  __tests__/dependency-cruiser-base.test.js \
  __tests__/fixtures/cruise-base-project/src/first.ts \
  __tests__/fixtures/cruise-base-project/src/second.ts \
  __tests__/fixtures/fsd-cruise-project/tsconfig.json \
  '__tests__/fixtures/fsd-cruise-project/src/**/*.{ts,tsx}'
```

Expected: all listed files are formatted. If this check fails, run Prettier only on the listed files, re-run the focused tests, and commit the formatting in the task whose files changed.

- [ ] **Step 6: Run the package test suite**

```bash
pnpm test
```

Expected: exit code 0. If an unrelated in-flight parity change fails, record the exact file and failure separately. Do not weaken fixture assertions or restore user work to obtain green output.

- [ ] **Step 7: Confirm commit boundaries**

Inspect the commits created by Tasks 1 through 3. Each must contain only its named files. Do not amend or sweep unrelated staged changes into these commits.
