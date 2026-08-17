import { plugins } from '#plugins';
import { javascript } from '#rules/javascript';
import { typescript } from '#rules/typescript';

import { readdir } from 'node:fs/promises';
import path from 'node:path';

import eslintJavaScript from '@eslint/js';
import typeScriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import { ESLint } from 'eslint';
import typeScript from 'typescript';

const SOURCE_FILE_PATTERNS = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];
const TYPESCRIPT_FILE_PATTERNS = ['**/*.ts', '**/*.tsx'];

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

export const collectFixtureSourceFiles = async (fixtureRoot) => {
    const absoluteFiles = await collectAbsoluteFixtureSourceFiles(fixtureRoot);

    return absoluteFiles.map((filePath) => toRelativePath(fixtureRoot, filePath)).toSorted();
};

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
                    // Programmatic ESLint tests are long-lived even when the outer process has CI=true.
                    disallowAutomaticSingleRunInference: true,
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

export const lintFixtureProject = async (fixtureRoot) => {
    const absoluteFiles = await collectAbsoluteFixtureSourceFiles(fixtureRoot);
    const eslint = new ESLint({
        cwd: fixtureRoot,
        overrideConfigFile: true,
        overrideConfig: createFixtureHygieneConfig(fixtureRoot)
    });
    const results = await eslint.lintFiles(absoluteFiles);

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
};

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
            rootFiles: [],
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
        rootFiles: program
            .getRootFileNames()
            .filter((filePath) => {
                const relativePath = path.relative(fixtureRoot, filePath);
                return (
                    relativePath !== '' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath)
                );
            })
            .map((filePath) => toRelativePath(fixtureRoot, filePath))
            .toSorted(),
        diagnostics: diagnostics.map((diagnostic) => normalizeTypeScriptDiagnostic(fixtureRoot, diagnostic))
    };
};
