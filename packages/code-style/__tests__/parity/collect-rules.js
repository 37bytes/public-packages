/**
 * @fileoverview Collectors for "effective enabled rule" sets across the three linters.
 *
 * The enabled set is "enabled for at least one glob": a rule counts as enabled if any
 * config object turns it on, even when a later files-scoped config turns it off for a
 * subset of files (per-glob narrowing). Only a GLOBAL 'off' (a config object with no
 * `files` key) removes the rule from the set. This mirrors the OxLint collector, which
 * keeps base rules that per-glob overrides disable — keeping the two sides symmetric so
 * the reverse parity check does not emit false "tool-only rule" reds for the
 * typescriptDisables family (no-undef, no-redeclare, no-use-before-define, etc.).
 *
 * ESLint side: walks flat-config arrays in merge order; only a global 'off' removes a rule.
 * OxLint side: reads the GENERATED oxlint/config.json (categories is empty — every rule explicit).
 *   Override entries only narrow per-glob; for the global enabled set we take base rules
 *   plus override ADDITIONS (rules introduced by an override, e.g. typescript/*).
 * Biome side: reads the GENERATED biome/config.json; keys are 'category/ruleName';
 *   severities are 'error' | 'warn' | 'off' | {level, options}.
 *   Domain-activated rules (react/next/test: 'all') are NOT in config.json rules;
 *   they come from biome-domain-rules.json (generated in Task 4) and are merged
 *   in by parity-static.check.js, not here.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..', '..');

/**
 * Read the severity out of an eslint rule value, covering all three shapes:
 *   tuple  ['warn', { option }]  -> element zero
 *   object { severity, ... }     -> the severity key (mirrors the biome { level, options } form)
 *   bare   'warn' | 2            -> the value itself
 */
const severityOf = (value) => {
    if (Array.isArray(value)) {
        return value[0];
    }
    if (typeof value === 'object' && value !== null) {
        return value.severity;
    }
    return value;
};
const isOff = (severity) => severity === 'off' || severity === 0;

/** Normalize numeric eslint severity to string. */
const normalizeEslintSeverity = (severity) => {
    if (severity === 2) {
        return 'error';
    }
    if (severity === 1) {
        return 'warn';
    }
    return severity;
};

/**
 * Enabled set = enabled for at least one glob. A files-scoped 'off' is per-glob narrowing
 * and does NOT remove the rule; only a global 'off' (config object without a `files` key) does.
 * @returns {Map<string, string>} ruleName -> 'error' | 'warn' (numeric severities normalized)
 */
export const collectEnabledEslintRules = (configArray) => {
    const enabled = new Map();
    for (const config of configArray) {
        if (!config.rules) {
            continue;
        }
        const isGlobalConfig = !config.files;
        for (const [ruleName, value] of Object.entries(config.rules)) {
            const severity = severityOf(value);
            if (isOff(severity)) {
                // Files-scoped offs narrow per-glob only; keep the rule enabled for other globs.
                if (isGlobalConfig) {
                    enabled.delete(ruleName);
                }
            } else {
                enabled.set(ruleName, normalizeEslintSeverity(severity));
            }
        }
    }
    return enabled;
};

/**
 * Union across presets. On conflict the first-seen severity wins; the union does NOT
 * escalate to the max severity (a rule that is 'warn' in the first preset stays 'warn'
 * even if a later preset sets it to 'error'). Deliberate: this set answers "is the rule
 * enabled anywhere", not "what is its strictest severity".
 * @returns {Map<string, string>} ruleName -> severity (first preset wins on conflict)
 */
export const collectEnabledUnion = (presetArrays) => {
    const union = new Map();
    for (const presetArray of presetArrays) {
        for (const [ruleName, severity] of collectEnabledEslintRules(presetArray)) {
            if (!union.has(ruleName)) {
                union.set(ruleName, severity);
            }
        }
    }
    return union;
};

/** @returns {Map<string, string>} oxlint ruleName -> severity, base rules + override additions */
export const collectOxlintRules = () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- PACKAGE_ROOT is a build-time constant, not user input
    const config = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'oxlint', 'config.json'), 'utf8'));
    const rules = new Map();
    for (const [ruleName, value] of Object.entries(config.rules ?? {})) {
        const severity = severityOf(value);
        if (!isOff(severity)) {
            rules.set(ruleName, severity);
        }
    }
    for (const override of config.overrides ?? []) {
        for (const [ruleName, value] of Object.entries(override.rules ?? {})) {
            const severity = severityOf(value);
            // An override 'off' narrows per-glob only; the rule stays globally enabled.
            // An override re-declaring a base rule with a different severity is intentionally
            // ignored (the `!rules.has` guard): base wins, per-glob overrides do not escalate globally.
            if (!isOff(severity) && !rules.has(ruleName)) {
                rules.set(ruleName, severity);
            }
        }
    }
    return rules;
};

/** Read a biome rule value's severity: object form is { level, options }, otherwise the value. */
const biomeSeverityOf = (value) => (typeof value === 'object' && value !== null ? value.level : value);

/**
 * Merge one biome linter.rules block ({ category: { rule: value } }) into `rules`.
 * Skips the `recommended` flag and 'off' entries. When `overwrite` is false, an existing
 * key is kept (base wins on conflict) — used for override blocks, which only ADD.
 */
const mergeBiomeRuleBlock = (rules, ruleBlock, overwrite) => {
    for (const [categoryName, categoryRules] of Object.entries(ruleBlock ?? {})) {
        if (categoryName === 'recommended') {
            continue;
        }
        for (const [ruleName, value] of Object.entries(categoryRules)) {
            const severity = biomeSeverityOf(value);
            const ruleKey = `${categoryName}/${ruleName}`;
            if (!isOff(severity) && (overwrite || !rules.has(ruleKey))) {
                rules.set(ruleKey, severity);
            }
        }
    }
};

/**
 * Collect biome base rules plus override ADDITIONS. The override blocks
 * (overrides[].linter.rules, e.g. the test-file glob) ENABLE rules not in the base block,
 * such as suspicious/noFocusedTests and suspicious/noDuplicateTestHooks; the reverse parity
 * check must see them. Mirrors collectOxlintRules: skip offs, base wins on conflict
 * (override re-declaring a base rule does not change it).
 * @returns {Map<string, string>} 'category/ruleName' -> severity from the generated biome config
 */
export const collectBiomeRules = () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- PACKAGE_ROOT is a build-time constant, not user input
    const config = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'biome', 'config.json'), 'utf8'));
    const rules = new Map();
    mergeBiomeRuleBlock(rules, config.linter?.rules, true);
    for (const override of config.overrides ?? []) {
        mergeBiomeRuleBlock(rules, override.linter?.rules, false);
    }
    return rules;
};
