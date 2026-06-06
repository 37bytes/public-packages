/**
 * @fileoverview Collectors for "effective enabled rule" sets across the three linters.
 *
 * ESLint side: walks flat-config arrays in merge order; a later 'off' removes the rule.
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
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..', '..');

const severityOf = (value) => (Array.isArray(value) ? value[0] : value);
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

/** @returns {Map<string, string>} ruleName -> 'error' | 'warn' (numeric severities normalized) */
export const collectEnabledEslintRules = (configArray) => {
    const enabled = new Map();
    for (const config of configArray) {
        if (!config.rules) {
            continue;
        }
        for (const [ruleName, value] of Object.entries(config.rules)) {
            const severity = severityOf(value);
            if (isOff(severity)) {
                enabled.delete(ruleName);
            } else {
                enabled.set(ruleName, normalizeEslintSeverity(severity));
            }
        }
    }
    return enabled;
};

/** Union across presets. @returns {Map<string, string>} ruleName -> severity (first preset wins on conflict) */
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
            if (!isOff(severity) && !rules.has(ruleName)) {
                rules.set(ruleName, severity);
            }
        }
    }
    return rules;
};

/** @returns {Map<string, string>} 'category/ruleName' -> severity from the generated biome config */
export const collectBiomeRules = () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- PACKAGE_ROOT is a build-time constant, not user input
    const config = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'biome', 'config.json'), 'utf8'));
    const rules = new Map();
    for (const [categoryName, categoryRules] of Object.entries(config.linter?.rules ?? {})) {
        if (categoryName === 'recommended') {
            continue;
        }
        for (const [ruleName, value] of Object.entries(categoryRules)) {
            const severity = typeof value === 'object' && value !== null ? value.level : value;
            if (!isOff(severity)) {
                rules.set(`${categoryName}/${ruleName}`, severity);
            }
        }
    }
    return rules;
};
