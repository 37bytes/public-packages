/**
 * @fileoverview Build script for OxLint configuration
 *
 * Assembles oxlint/config.json and oxlint/perfectionist.json from
 * modular rule files in oxlint/rules/ and oxlint/infrastructure.js.
 * Validates all rule names against `oxlint --rules` output.
 *
 * Usage: pnpm build:oxlint
 *   (runs `node oxlint/build.js && prettier --write oxlint/*.json .oxlintrc.json`)
 */

import { execSync } from 'node:child_process';
import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { categories, env, jsPlugins, overrideFiles, plugins, schema } from './infrastructure.js';
import {
    browser,
    custom,
    imports,
    javascript,
    nextjs,
    node,
    perfectionist,
    perfectionistImportOverrides,
    perfectionistJsPlugin,
    quality,
    react,
    regexp,
    storybook,
    testing,
    typescriptDisables,
    typescriptRules
} from './rules/index.js';

const oxlintDir = import.meta.dirname;
const rootDir = join(oxlintDir, '..');

// ── Schema Validation ────────────────────────────────────────────────

/**
 * Extract valid rule names from `oxlint --rules` output.
 * Returns Set of rule names in OxLint config format:
 *   - ESLint core: 'eqeqeq', 'no-console' (no prefix)
 *   - Plugins: 'typescript/no-explicit-any', 'react/jsx-key'
 */
const extractValidRules = () => {
    const output = execSync('npx oxlint --rules', { encoding: 'utf8' });
    const validRules = new Set();

    for (const line of output.split('\n')) {
        if (!line.startsWith('|')) {
            continue;
        }

        const match = line.match(/^\|\s+(\S+)\s+\|\s+(\S+)/);
        if (!match) {
            continue;
        }

        const [, ruleName, source] = match;
        if (ruleName === 'Rule' || ruleName === '---') {
            continue;
        }

        // ESLint core rules have no prefix in OxLint config
        // Plugin rules use source as prefix: typescript/rule-name
        validRules.add(source === 'eslint' ? ruleName : `${source}/${ruleName}`);
    }

    return validRules;
};

/**
 * Validate all rules in a rule object against known OxLint rules.
 * jsPlugins rules (sonarjs/*, regexp/*, storybook/*, @37bytes/*) are skipped —
 * they're ESLint plugins bridged via OxLint's jsPlugins, not native OxLint rules.
 */
const validateRules = (rules, validRules, label) => {
    const jsPluginPrefixes = jsPlugins.map((plugin) => `${plugin.name}/`);
    const errors = [];

    for (const ruleName of Object.keys(rules)) {
        // Skip jsPlugins — they're bridged ESLint plugins, not in OxLint's rule list
        if (jsPluginPrefixes.some((prefix) => ruleName.startsWith(prefix))) {
            continue;
        }

        if (!validRules.has(ruleName)) {
            errors.push(ruleName);
        }
    }

    if (errors.length > 0) {
        console.error(`\nRule validation failed in ${label}:\n`);
        for (const error of errors) {
            console.error(`  ✗ ${error}`);
        }
        throw new Error(`${errors.length} invalid rule(s) found in ${label}. Fix rule names and rebuild.`);
    }
};

// ── Build ────────────────────────────────────────────────────────────

const config = {
    $schema: schema,
    plugins,
    jsPlugins,
    categories,
    env,
    rules: {
        ...javascript,
        ...browser,
        ...imports,
        ...react,
        ...nextjs,
        ...node,
        ...custom,
        ...quality,
        ...regexp
    },
    overrides: [
        {
            files: overrideFiles.typescript,
            rules: {
                ...typescriptDisables,
                ...typescriptRules
            }
        },
        {
            files: overrideFiles.testing,
            rules: testing
        },
        {
            files: overrideFiles.storybook,
            rules: storybook
        }
    ]
};

// Validate all rule names against oxlint --rules
const validRules = extractValidRules();
validateRules(config.rules, validRules, 'base rules');
for (const override of config.overrides) {
    validateRules(override.rules, validRules, `override [${override.files[0]}]`);
}
console.log(`Rule validation passed ✓ (${validRules.size} known rules)`);

// Write config.json
const configPath = join(oxlintDir, 'config.json');
writeFileSync(configPath, `${JSON.stringify(config, null, 4)}\n`);

// === Build perfectionist.json ===

const perfectionistConfig = {
    $schema: schema,
    extends: ['./config.json'],
    jsPlugins: [perfectionistJsPlugin],
    rules: {
        ...perfectionistImportOverrides,
        ...perfectionist
    }
};

// Perfectionist rules are all jsPlugin — skip validation (not native)
const perfectionistPath = join(oxlintDir, 'perfectionist.json');
writeFileSync(perfectionistPath, `${JSON.stringify(perfectionistConfig, null, 4)}\n`);

// === Copy config.json to root .oxlintrc.json (jsPlugins path resolution) ===

copyFileSync(configPath, join(rootDir, '.oxlintrc.json'));

const configRuleCount = Object.keys(config.rules).length;
const overrideRuleCounts = config.overrides.map((override) => Object.keys(override.rules).length);
const perfRuleCount = Object.keys(perfectionistConfig.rules).length;

console.log(
    `config.json: ${configRuleCount} base rules, ` +
        `${config.overrides.length} overrides (${overrideRuleCounts.join(', ')} rules) | ` +
        `perfectionist.json: ${perfRuleCount} rules | .oxlintrc.json synced`
);
