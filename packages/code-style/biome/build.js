/**
 * Biome config builder
 *
 * Assembles biome/config.json from modular rule files.
 * Validates all rule names against Biome's JSON Schema.
 *
 * Usage: node biome/build.js
 */

import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { biomeVersion, domains, formatter, jsFormatter, overrideFiles, schema } from './infrastructure.js';
import {
    imports,
    javascript,
    nextjs,
    quality,
    react,
    testing,
    typescript,
    typescriptNursery,
    typescriptOverrides
} from './rules/index.js';

// Version-keyed cache filename. A bare `.schema-cache.json` (no version) would be
// reused across biome bumps via existsSync alone, silently validating new rule names
// against a stale schema. Keying the filename on biomeVersion forces a re-fetch on bump.
const SCHEMA_CACHE_PATH = join(import.meta.dirname, `.schema-cache-${biomeVersion}.json`);

/**
 * Remove stale schema caches (any .schema-cache*.json that is not the current version's).
 * Keeps the working tree clean when the biome peer version changes.
 */
const pruneStaleSchemaCaches = () => {
    const currentFileName = `.schema-cache-${biomeVersion}.json`;
    const cacheFiles = readdirSync(import.meta.dirname).filter(
        (fileName) => fileName.startsWith('.schema-cache') && fileName.endsWith('.json') && fileName !== currentFileName
    );
    for (const fileName of cacheFiles) {
        unlinkSync(join(import.meta.dirname, fileName));
        console.log('Pruned stale schema cache:', fileName);
    }
};

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Deep merge rule sets by Biome category.
 * Each rule set is { suspicious: {...}, style: {...}, ... }
 * Result: merged categories with all rules from all sets.
 */
const deepMergeByCategory = (...rulesets) => {
    const result = {};
    for (const ruleset of rulesets) {
        for (const [category, rules] of Object.entries(ruleset)) {
            result[category] = { ...result[category], ...rules };
        }
    }
    return result;
};

/**
 * Count total rules across all categories
 */
const countRules = (mergedRules) => {
    let total = 0;
    for (const category of Object.values(mergedRules)) {
        total += Object.keys(category).length;
    }
    return total;
};

// ── Schema Validation ────────────────────────────────────────────────

/**
 * Fetch Biome JSON Schema (cached locally).
 * Downloads once, then reuses .schema-cache.json.
 */
const fetchSchema = async () => {
    if (existsSync(SCHEMA_CACHE_PATH)) {
        return JSON.parse(readFileSync(SCHEMA_CACHE_PATH, 'utf8'));
    }

    console.log('Downloading Biome JSON Schema...');
    const response = await fetch(schema);
    if (!response.ok) {
        console.warn(`Warning: could not fetch schema (${response.status}), skipping validation`);
        return null;
    }

    const schemaData = await response.json();
    writeFileSync(SCHEMA_CACHE_PATH, JSON.stringify(schemaData, null, 2));
    console.log('Schema cached at', SCHEMA_CACHE_PATH);
    return schemaData;
};

/**
 * Extract valid rule names from Biome JSON Schema.
 * Returns Map<category, Set<ruleName>>
 */
const extractValidRules = (schemaData) => {
    const validRules = new Map();

    const defs = schemaData?.definitions || schemaData?.['$defs'];
    if (!defs) {
        return validRules;
    }

    // Biome schema defines categories directly (e.g. Suspicious, Style, Complexity)
    // Each definition has properties that are the rule names
    const categories = [
        'Suspicious',
        'Style',
        'Complexity',
        'Correctness',
        'Security',
        'Performance',
        'Nursery',
        'A11y'
    ];

    for (const category of categories) {
        const def = defs[category];
        if (def?.properties) {
            // Filter out 'recommended' and 'all' — they're group-level settings, not rules
            const ruleNames = Object.keys(def.properties).filter((name) => name !== 'recommended' && name !== 'all');
            validRules.set(category.toLowerCase(), new Set(ruleNames));
        }
    }

    return validRules;
};

/**
 * Validate all rules in merged config against schema.
 * Throws on invalid rule names.
 */
const validateRules = (mergedRules, validRules) => {
    if (validRules.size === 0) {
        console.warn('Warning: no schema data, skipping rule name validation');
        return;
    }

    const errors = [];

    for (const [category, rules] of Object.entries(mergedRules)) {
        const validNames = validRules.get(category);
        if (!validNames) {
            errors.push(`Unknown category: "${category}"`);
            continue;
        }

        for (const ruleName of Object.keys(rules)) {
            if (!validNames.has(ruleName)) {
                errors.push(`Invalid rule: ${category}/${ruleName}`);
            }
        }
    }

    if (errors.length > 0) {
        console.error('\nRule validation failed:\n');
        for (const error of errors) {
            console.error(`  ✗ ${error}`);
        }
        console.error(`\n${errors.length} invalid rule(s) found. Fix rule names and rebuild.\n`);
        throw new Error(`${errors.length} invalid rule(s) found. Fix rule names and rebuild.`);
    }

    console.log('Rule validation passed ✓');
};

// ── Config Assembly ──────────────────────────────────────────────────

// ── Main ─────────────────────────────────────────────────────────────

const build = async () => {
    console.log('Building Biome config...\n');

    // 1. Merge base rules by category
    const baseRules = deepMergeByCategory(javascript, typescript, typescriptNursery, react, nextjs, imports, quality);

    // 2. Validate against schema (prune stale-version caches first)
    pruneStaleSchemaCaches();
    const schemaData = await fetchSchema();
    if (schemaData) {
        const validRules = extractValidRules(schemaData);
        validateRules(baseRules, validRules);
        validateRules(typescriptOverrides, validRules);
        validateRules(testing, validRules);
    }

    // 3. Assemble config
    const config = {
        $schema: schema,
        vcs: {
            enabled: true,
            clientKind: 'git',
            useIgnoreFile: true
        },
        formatter,
        javascript: {
            formatter: jsFormatter
        },
        linter: {
            enabled: true,
            domains,
            rules: {
                recommended: false,
                ...baseRules
            }
        },
        overrides: [
            {
                includes: overrideFiles.typescript,
                linter: {
                    rules: typescriptOverrides
                }
            },
            {
                includes: overrideFiles.testing,
                linter: {
                    rules: testing
                }
            },
            {
                // Next.js App Router conventions require default exports.
                // Mirror ESLint's nextjsOverrides (eslint/config.js:265-283).
                includes: overrideFiles.nextjsAppRouter,
                linter: {
                    rules: {
                        style: {
                            noDefaultExport: 'off'
                        }
                    }
                }
            }
        ]
    };

    // 4. Write config.json
    const outputPath = join(import.meta.dirname, 'config.json');
    writeFileSync(outputPath, `${JSON.stringify(config, null, 4)}\n`);

    // 5. Stats
    const baseCount = countRules(baseRules);
    const tsOverrideCount = countRules(typescriptOverrides);
    const testOverrideCount = countRules(testing);

    console.log(`\nBiome config built successfully:`);
    console.log(`  Base rules:       ${baseCount}`);
    console.log(`  TS overrides:     ${tsOverrideCount}`);
    console.log(`  Test overrides:   ${testOverrideCount}`);
    console.log(`  Total:            ${baseCount + tsOverrideCount + testOverrideCount}`);
    console.log(`\n  Output: ${outputPath}`);
};

await build();
