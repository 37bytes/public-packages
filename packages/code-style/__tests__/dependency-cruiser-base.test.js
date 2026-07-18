import assert from 'node:assert';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { describe, test } from 'node:test';
import { promisify } from 'node:util';

import { createBaseCruiserConfig } from '../dependency-cruiser/base.js';

const execFileAsync = promisify(execFile);
const FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'cruise-base-project');
const DEPCRUISE_BIN = path.join(import.meta.dirname, '..', 'node_modules', '.bin', 'depcruise');

/**
 * Имена правил полного init-набора.
 * 7 правил из shipped recommended + 4 проектных расширения.
 * Источник правды для имён shipped-правил: node_modules/dependency-cruiser/configs/rules/
 */
const EXPECTED_BASE_RULE_NAMES = [
    'no-circular',
    'no-orphans',
    'no-deprecated-core',
    'not-to-deprecated',
    'no-non-package-json',
    'not-to-unresolvable',
    'no-duplicate-dep-types',
    'not-to-test',
    'not-to-dev-dep',
    'optional-deps-used',
    'peer-deps-used'
];

describe('createBaseCruiserConfig: shape', () => {
    test('содержит полный init-набор правил', () => {
        const config = createBaseCruiserConfig();
        const ruleNames = config.forbidden.map((rule) => rule.name).toSorted();
        assert.deepStrictEqual(ruleNames, EXPECTED_BASE_RULE_NAMES.toSorted());
    });

    test('tsPreCompilationDeps включён (probe-факт: без него граф пустой)', () => {
        const config = createBaseCruiserConfig();
        assert.strictEqual(config.options.tsPreCompilationDeps, true);
    });

    test('includeOnly отсутствует (probe-факт: ломает required и not-to-unresolvable)', () => {
        const config = createBaseCruiserConfig();
        assert.strictEqual('includeOnly' in config.options, false);
    });

    test('tsConfigFileName переопределяется опцией', () => {
        const config = createBaseCruiserConfig({ tsConfigFileName: 'tsconfig.build.json' });
        assert.strictEqual(config.options.tsConfig.fileName, 'tsconfig.build.json');
    });

    test('no-circular имеет severity error', () => {
        const config = createBaseCruiserConfig();
        const noCircular = config.forbidden.find((rule) => rule.name === 'no-circular');
        assert.strictEqual(noCircular.severity, 'error');
    });
});

const runDepcruise = async (fixtureRoot) => {
    try {
        const { stdout } = await execFileAsync(
            DEPCRUISE_BIN,
            ['--config', '.dependency-cruiser.mjs', '--output-type', 'json', 'src'],
            { cwd: fixtureRoot, maxBuffer: 16 * 1024 * 1024 }
        );
        return JSON.parse(stdout);
    } catch (error) {
        // depcruise exits with nonzero when violations are found; stdout is still valid JSON
        if (error.stdout) {
            return JSON.parse(error.stdout);
        }
        throw error;
    }
};

const violationSet = (cruiseResult) =>
    cruiseResult.summary.violations
        .map((violation) => `${violation.rule.name}: ${violation.from} -> ${violation.to}`)
        .toSorted();

describe('createBaseCruiserConfig: поведение на фикстуре', () => {
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
});

describe('package exports', () => {
    test('@37bytes/code-style/dependency-cruiser резолвится (self-reference)', async () => {
        const moduleExports = await import('@37bytes/code-style/dependency-cruiser');
        assert.strictEqual(typeof moduleExports.createBaseCruiserConfig, 'function');
        assert.strictEqual(typeof moduleExports.createFsdCruiserConfig, 'function');
    });
});
