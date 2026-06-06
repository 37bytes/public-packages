/**
 * @fileoverview Layer 1 parity: static list comparison. No linter executes here.
 *
 * Forward check:  bridge off-list ∩ eslint-enabled  =>  tool config must enable an equivalent (severity-matched).
 * Reverse check:  every tool-enabled rule            =>  must reverse-map to an eslint-enabled rule.
 *
 * BUMP SHIELD — this test guards bumps of: oxlint, @biomejs/biome, eslint-plugin-oxlint,
 * eslint-config-biome, eslint-plugin-n. It is BLIND to: @eslint-react/* and @next/next/*
 * coverage drift on the oxlint side (the bridge off-list only knows legacy react/* names) —
 * those flow through the manual sections of rule-equivalence.js and Layer 2 fixtures.
 *
 * EXPECTED RED until the drift-fix plan lands: severity mismatches and tool-only rules
 * found by the 2026-06 audit fail here BY DESIGN.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, test } from 'node:test';

import oxlintPlugin from 'eslint-plugin-oxlint';

import { nextjs, nodejsRuntime, nodejsTool, spa } from '../eslint/index.js';
import { collectBiomeRules, collectEnabledUnion, collectOxlintRules } from './parity/collect-rules.js';
import { knownGaps } from './parity/known-gaps.js';
import { resolveBiomeEquivalent, resolveOxlintEquivalent, reverseToEslint } from './parity/rule-equivalence.js';

const require = createRequire(import.meta.url);
const biomeBridge = require('eslint-config-biome');
// CJS: { rules } with 557 entries, severities 0 | 'off'
const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..');

// --- assemble the sets -------------------------------------------------------
const eslintEnabled = collectEnabledUnion([spa, nextjs, nodejsRuntime, nodejsTool]);
const oxlintRules = collectOxlintRules();
const biomeExplicitRules = collectBiomeRules();
const biomeDomainRules = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- PACKAGE_ROOT is a build-time constant derived from import.meta.dirname, not user input
    readFileSync(path.join(PACKAGE_ROOT, '__tests__', 'parity', 'biome-domain-rules.json'), 'utf8')
).rules;
const biomeEnabled = new Map(biomeExplicitRules);
for (const ruleKey of Object.keys(biomeDomainRules)) {
    if (!biomeEnabled.has(ruleKey)) {
        biomeEnabled.set(ruleKey, 'domain');
    }
}

// oxlint off-list: configs['flat/all'] is an ARRAY of config objects (verified 2026-06-07).
// Deduplicate: the same rule can appear in more than one config object in the array, which would
// otherwise register duplicate node:test cases with identical names (a future-proofing guard).
const oxlintOffList = [
    ...new Set(oxlintPlugin.configs['flat/all'].flatMap((config) => (config.rules ? Object.keys(config.rules) : [])))
];
const biomeOffList = [...new Set(Object.keys(biomeBridge.rules))];

// known-gaps entries may carry an optional tools: ['biome'|'oxlint'] scope; unscoped applies to both
const gapApplies = (eslintRule, tool) => {
    const gap = knownGaps[eslintRule];
    return Boolean(gap) && (!gap.tools || gap.tools.includes(tool));
};

describe('guards against vacuous green', () => {
    test('oxlint off-list extracted non-empty', () => {
        assert.ok(
            oxlintOffList.length > 100,
            `oxlint off-list has ${oxlintOffList.length} entries — extraction broken (plugin shape changed?)`
        );
    });
    test('biome off-list extracted non-empty', () => {
        assert.ok(biomeOffList.length > 100, `biome off-list has ${biomeOffList.length} entries — extraction broken`);
    });
    test('eslint enabled union is plausible', () => {
        assert.ok(eslintEnabled.size > 300, `eslint enabled union has ${eslintEnabled.size} rules`);
    });
    test('biome domain rules file is non-empty', () => {
        assert.ok(
            Object.keys(biomeDomainRules).length > 0,
            'biome-domain-rules.json is empty — regenerate (Task 4 Step 1)'
        );
    });
});

describe('Layer 1 forward: bridge-disabled eslint rules must have enabled tool equivalents', () => {
    const oxlintCandidates = oxlintOffList.filter((ruleName) => eslintEnabled.has(ruleName));
    test('oxlint candidate set is the intersection, not the whole off-list', () => {
        assert.ok(
            oxlintCandidates.length > 50 && oxlintCandidates.length < oxlintOffList.length,
            `${oxlintCandidates.length} oxlint candidates`
        );
    });
    for (const eslintRule of oxlintOffList.filter((ruleName) => eslintEnabled.has(ruleName))) {
        test(`oxlint covers ${eslintRule}`, () => {
            if (gapApplies(eslintRule, 'oxlint')) {
                return;
            }
            const equivalent = resolveOxlintEquivalent(eslintRule);
            assert.notStrictEqual(
                equivalent,
                undefined,
                `${eslintRule}: unmapped namespace — add to rule-equivalence.js`
            );
            if (equivalent === null) {
                assert.fail(
                    `${eslintRule}: bridge disables it, mapping says no oxlint equivalent, and no known-gaps entry exists`
                );
            }
            assert.ok(
                oxlintRules.has(equivalent),
                `${eslintRule}: bridge disables it but oxlint config does not enable ${equivalent}`
            );
            const eslintSeverity = eslintEnabled.get(eslintRule);
            const oxlintSeverity = oxlintRules.get(equivalent);
            assert.strictEqual(
                oxlintSeverity,
                eslintSeverity,
                `${eslintRule} -> ${equivalent}: severity drift (eslint=${eslintSeverity}, oxlint=${oxlintSeverity})`
            );
        });
    }
    for (const eslintRule of biomeOffList.filter((ruleName) => eslintEnabled.has(ruleName))) {
        test(`biome covers ${eslintRule}`, () => {
            if (gapApplies(eslintRule, 'biome')) {
                return;
            }
            const resolution = resolveBiomeEquivalent(eslintRule);
            assert.notStrictEqual(
                resolution,
                undefined,
                `${eslintRule}: not in the biome manual table — add an entry (string, {biome, partial}, or null + known-gaps)`
            );
            if (resolution === null) {
                assert.fail(
                    `${eslintRule}: bridge disables it, mapping says no biome equivalent, and no known-gaps entry exists`
                );
            }
            assert.ok(
                biomeEnabled.has(resolution.biomeRule),
                `${eslintRule}: bridge disables it but biome config does not enable ${resolution.biomeRule}`
            );
            if (!resolution.partial) {
                const biomeSeverity = biomeEnabled.get(resolution.biomeRule);
                // domain-activated rules have no per-rule severity setting; skip severity comparison
                if (biomeSeverity !== 'domain') {
                    assert.strictEqual(
                        biomeSeverity,
                        eslintEnabled.get(eslintRule),
                        `${eslintRule} -> ${resolution.biomeRule}: severity drift (eslint=${eslintEnabled.get(eslintRule)}, biome=${biomeSeverity})`
                    );
                }
            }
        });
    }
});

describe('Layer 1 reverse: every tool-enabled rule must trace back to an enabled eslint rule', () => {
    for (const [oxlintRule] of collectOxlintRules()) {
        test(`oxlint ${oxlintRule} has an eslint source`, () => {
            const eslintRule = reverseToEslint('oxlint', oxlintRule);
            assert.notStrictEqual(
                eslintRule,
                null,
                `oxlint enables ${oxlintRule} with no eslint counterpart — promote it into eslint or trim it (policy: promotion-first)`
            );
            assert.ok(
                eslintEnabled.has(eslintRule),
                `oxlint enables ${oxlintRule} -> ${eslintRule}, but no eslint preset enables it`
            );
        });
    }
    for (const [biomeRule] of collectBiomeRules()) {
        test(`biome ${biomeRule} has an eslint source`, () => {
            const eslintRule = reverseToEslint('biome', biomeRule);
            assert.notStrictEqual(
                eslintRule,
                null,
                `biome enables ${biomeRule} with no eslint counterpart — promote or trim (policy: promotion-first)`
            );
            assert.ok(
                eslintEnabled.has(eslintRule),
                `biome enables ${biomeRule} -> ${eslintRule}, but no eslint preset enables it`
            );
        });
    }
});
