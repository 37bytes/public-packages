import assert from 'node:assert';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { describe, test } from 'node:test';
import { promisify } from 'node:util';

import { createBaseCruiserConfig } from '../dependency-cruiser/base.js';
import { createFsdCruiserConfig } from '../dependency-cruiser/fsd.js';

const execFileAsync = promisify(execFile);
const FIXTURE_ROOT = path.join(import.meta.dirname, 'fixtures', 'fsd-cruise-project');
const DEPCRUISE_BIN = path.join(import.meta.dirname, '..', 'node_modules', '.bin', 'depcruise');

const runDepcruise = async () => {
    try {
        const { stdout } = await execFileAsync(
            DEPCRUISE_BIN,
            ['--config', '.dependency-cruiser.mjs', '--output-type', 'json', 'src'],
            { cwd: FIXTURE_ROOT, maxBuffer: 16 * 1024 * 1024 }
        );
        return JSON.parse(stdout);
    } catch (executionError) {
        if (executionError.stdout) {
            return JSON.parse(executionError.stdout);
        }
        throw executionError;
    }
};

const violationSet = (cruiseResult) =>
    cruiseResult.summary.violations
        .map((violation) => `${violation.rule.name}: ${violation.from} -> ${violation.to}`)
        .toSorted();

describe('createFsdCruiserConfig: поведение на фикстуре (ground truth: probe 2026-06-07)', () => {
    test('матрица нарушений совпадает поштучно', async () => {
        const result = await runDepcruise();
        assert.deepStrictEqual(
            violationSet(result),
            [
                'layers-entities-up: src/entities/user/model/types.ts -> src/features/auth/index.ts',
                'layers-features-up: src/features/auth/model/store.ts -> src/pages/home/index.ts',
                'layers-shared-up: src/shared/lib/classNames/index.ts -> src/entities/user/index.ts',
                'layers-widgets-up: src/widgets/header/ui/Header.tsx -> src/pages/home/index.ts',
                'no-cross-segment: src/widgets/header/api/getHeader.ts -> src/widgets/header/ui/Header.tsx',
                'no-cross-slice: src/entities/user/model/types.ts -> src/entities/session/index.ts',
                'no-cross-slice: src/features/auth/model/store.ts -> src/features/search/index.ts',
                'no-deep-into-shared: src/features/auth/model/store.ts -> src/shared/config/theme.ts',
                'no-deep-into-slice-from-flat: src/app/index.ts -> src/features/auth/model/store.ts',
                'no-deep-into-shared: src/features/auth/model/store.ts -> src/shared/lib/classNames/utils.ts',
                'no-deep-into-shared: src/features/auth/model/store.ts -> src/shared/ui/Button.ts',
                'no-deep-into-slice-from-slice: src/features/auth/model/store.ts -> src/entities/user/model/types.ts',
                'no-slice-self-import: src/entities/user/model/types.ts -> src/entities/user/index.ts',
                'require-client-only: src/features/auth/client.ts -> src/features/auth/client.ts',
                'require-server-only: src/entities/user/server.ts -> src/entities/user/server.ts',
                'require-server-only: src/features/auth/server.ts -> src/features/auth/server.ts'
            ].toSorted()
        );
    });
});

describe('createFsdCruiserConfig: shape', () => {
    test('includeBaseRules: true (default) добавляет base-набор', () => {
        const fsdConfig = createFsdCruiserConfig();
        const baseConfig = createBaseCruiserConfig();
        const fsdRuleNames = new Set(fsdConfig.forbidden.map((rule) => rule.name));
        for (const baseRule of baseConfig.forbidden) {
            assert.ok(fsdRuleNames.has(baseRule.name), `base-правило ${baseRule.name} отсутствует`);
        }
    });

    test('includeBaseRules: false оставляет только FSD-правила', () => {
        const fsdConfig = createFsdCruiserConfig({ includeBaseRules: false });
        const ruleNames = new Set(fsdConfig.forbidden.map((rule) => rule.name));
        assert.ok(!ruleNames.has('no-orphans'));
        assert.ok(ruleNames.has('no-cross-slice'));
    });

    test('sourceRoot параметризует все пути правил', () => {
        const config = createFsdCruiserConfig({ sourceRoot: 'lib', includeBaseRules: false });
        const serialized = JSON.stringify(config.forbidden);
        assert.ok(!serialized.includes('^src/'));
        assert.ok(serialized.includes('^lib/'));
    });

    test('extraPublicApiPatterns попадают в pathNot deep-правил', () => {
        const config = createFsdCruiserConfig({
            extraPublicApiPatterns: ['^src/shared/config/'],
            includeBaseRules: false
        });
        const deepIntoShared = config.forbidden.find((rule) => rule.name === 'no-deep-into-shared');
        assert.ok(deepIntoShared.to.pathNot.includes('^src/shared/config/'));

        // паттерн просачивается и в slice-deep-правила через общий slicePublicApi
        const deepFromSlice = config.forbidden.find((rule) => rule.name === 'no-deep-into-slice-from-slice');
        assert.ok(deepFromSlice.to.pathNot.includes('^src/shared/config/'));

        const deepFromFlat = config.forbidden.find((rule) => rule.name === 'no-deep-into-slice-from-flat');
        assert.ok(deepFromFlat.to.pathNot.includes('^src/shared/config/'));
    });

    test('no-cross-segment включён с severity error (решение Д.)', () => {
        const config = createFsdCruiserConfig({ includeBaseRules: false });
        const crossSegment = config.forbidden.find((rule) => rule.name === 'no-cross-segment');
        assert.strictEqual(crossSegment.severity, 'error');
    });
});
