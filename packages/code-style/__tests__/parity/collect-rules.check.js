import assert from 'node:assert';
import { describe, test } from 'node:test';

import { nextjs, nodejsRuntime, nodejsTool, spa } from '../../eslint/index.js';
import {
    collectBiomeRules,
    collectEnabledEslintRules,
    collectEnabledUnion,
    collectOxlintRules
} from './collect-rules.js';

describe('collectEnabledEslintRules', () => {
    test('spa preset yields the verified count of enabled rules', () => {
        const enabled = collectEnabledEslintRules(spa);
        // Verified empirically 2026-06-07 (plan-facts, eslint-config-surface): 345.
        // Allow small drift window so unrelated rule additions do not break this guard.
        assert.ok(enabled.size >= 330 && enabled.size <= 360, `spa enabled count out of range: ${enabled.size}`);
        assert.strictEqual(enabled.get('no-console'), 'error');
        assert.strictEqual(enabled.has('no-undef'), false, 'no-undef is turned off by typescript layer');
    });

    test('later off entries remove earlier enables (flat-config merge order)', () => {
        const enabled = collectEnabledEslintRules([
            { rules: { 'demo-rule': 'error' } },
            { rules: { 'demo-rule': 'off' } }
        ]);
        assert.strictEqual(enabled.has('demo-rule'), false);
    });

    test('tuple severities are read from element zero', () => {
        const enabled = collectEnabledEslintRules([{ rules: { 'demo-rule': ['warn', { option: true }] } }]);
        assert.strictEqual(enabled.get('demo-rule'), 'warn');
    });
});

describe('collectEnabledUnion', () => {
    test('union covers rules present in any preset', () => {
        const union = collectEnabledUnion([spa, nextjs, nodejsRuntime, nodejsTool]);
        assert.ok(union.has('@next/next/no-img-element'), 'nextjs-only rule must be in union');
        assert.ok(union.has('n/no-process-env'), 'node-only rule must be in union');
        assert.ok(union.has('@eslint-react/no-missing-key'), 'react rule must be in union');
    });
});

describe('collectOxlintRules', () => {
    test('reads generated config with base rules and override additions', () => {
        const oxlintRules = collectOxlintRules();
        // Verified 2026-06-07: 303 base rules + override additions.
        assert.ok(oxlintRules.size >= 300, `oxlint rule count suspiciously low: ${oxlintRules.size}`);
        assert.strictEqual(oxlintRules.get('no-self-compare'), 'error');
        assert.strictEqual(oxlintRules.get('typescript/no-explicit-any'), 'error');
        assert.strictEqual(
            oxlintRules.has('no-undef'),
            true,
            'no-undef is enabled in base (error); the TS override turns it off only per-glob — the global collector keeps it (override narrows per-glob only)'
        );
    });
});

describe('collectBiomeRules', () => {
    test('reads generated config including option-bearing object severities', () => {
        const biomeRules = collectBiomeRules();
        // Verified 2026-06-07: 117 base explicit rules.
        assert.ok(biomeRules.size >= 110, `biome rule count suspiciously low: ${biomeRules.size}`);
        assert.strictEqual(biomeRules.get('suspicious/noConsole'), 'error');
        assert.strictEqual(
            biomeRules.get('complexity/noExcessiveCognitiveComplexity'),
            'warn',
            'object form {level, options} must resolve to its level'
        );
    });
});
