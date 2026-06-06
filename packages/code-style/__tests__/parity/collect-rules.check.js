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
        // Verified empirically 2026-06-07 (enabled = enabled-for-at-least-one-glob): 371
        // after D/E promotions (TypeScript, react, imports, nextjs, testing rules added).
        // Tight ±20 window.
        assert.ok(enabled.size >= 351 && enabled.size <= 391, `spa enabled count out of range: ${enabled.size}`);
        assert.strictEqual(enabled.get('no-console'), 'error');
        assert.strictEqual(
            enabled.has('no-undef'),
            true,
            'no-undef is enabled globally (error); the typescript layer turns it off only for **/*.ts(x) globs — per-glob narrowing keeps it in the enabled-for-at-least-one-glob set'
        );
    });

    test('global off entries remove earlier enables (flat-config merge order)', () => {
        const enabled = collectEnabledEslintRules([
            { rules: { 'demo-rule': 'error' } },
            { rules: { 'demo-rule': 'off' } }
        ]);
        assert.strictEqual(enabled.has('demo-rule'), false);
    });

    test('files-scoped off does NOT remove (per-glob narrowing)', () => {
        const enabled = collectEnabledEslintRules([
            { rules: { 'demo-rule': 'error' } },
            { files: ['**/*.ts'], rules: { 'demo-rule': 'off' } }
        ]);
        assert.strictEqual(
            enabled.has('demo-rule'),
            true,
            'a files-scoped off narrows per-glob; the rule stays enabled for other globs'
        );
    });

    test('tuple severities are read from element zero', () => {
        const enabled = collectEnabledEslintRules([{ rules: { 'demo-rule': ['warn', { option: true }] } }]);
        assert.strictEqual(enabled.get('demo-rule'), 'warn');
    });

    test('object-form severities are read from the severity key', () => {
        const enabled = collectEnabledEslintRules([{ rules: { 'demo-rule': { severity: 'warn', option: true } } }]);
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
        // Verified 2026-06-07: 365 (base rules + override additions, after D0/D/E promotions).
        // Tight ±20 window.
        assert.ok(oxlintRules.size >= 345 && oxlintRules.size <= 385, `oxlint count out of range: ${oxlintRules.size}`);
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
        // Verified 2026-06-07: 117 base explicit rules + ~4 override additions from overrides[1].
        assert.ok(biomeRules.size >= 110, `biome rule count suspiciously low: ${biomeRules.size}`);
        assert.strictEqual(biomeRules.get('suspicious/noConsole'), 'error');
        assert.strictEqual(
            biomeRules.get('complexity/noExcessiveCognitiveComplexity'),
            'warn',
            'object form {level, options} must resolve to its level'
        );
        assert.strictEqual(
            biomeRules.has('suspicious/noFocusedTests'),
            true,
            'override additions are merged: noFocusedTests comes from overrides[1] (test-file glob), not the base block'
        );
    });
});
