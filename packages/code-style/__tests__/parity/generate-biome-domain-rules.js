/**
 * @fileoverview One-shot generator: which biome rules are activated by the domains
 * we enable (react/next/test: 'all') but are NOT listed explicitly in config.json.
 * Method: `biome explain <rule>` prints rule metadata including its domains.
 * Output: biome-domain-rules.json, checked in, regenerated on biome bumps.
 * Run: node __tests__/parity/generate-biome-domain-rules.js
 *
 * NOTE on actual `biome explain` format (verified 2026-06-07 against biome 2.4.13):
 * The output is NOT a single "Domains: react, next" line. Instead it is a structured
 * multi-line section:
 *
 *   Domains
 *
 *   - Name: react
 *   - The rule is recommended for this domain
 *   ...
 *   - Name: next
 *   ...
 *
 * Parser strategy: find the "Domains" section header (standalone line), then collect
 * every "- Name: <domain>" line until the next blank-line-then-capitalized-word section
 * (e.g. "Description", "Examples"). Section boundaries in biome explain output are
 * marked by a capitalized word on its own line preceded by a blank line.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUR_DOMAINS = new Set(['react', 'next', 'test']);

// eslint-disable-next-line security/detect-non-literal-fs-filename -- PACKAGE_ROOT is a build-time constant derived from import.meta.dirname, not user input
const schema = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'biome', '.schema-cache.json'), 'utf8'));
const biomeBinary = path.join(PACKAGE_ROOT, 'node_modules', '.bin', 'biome');
const domainRules = {};

/**
 * Parse domain names from `biome explain <rule>` output.
 * Returns an array of lowercase domain strings (may be empty if no Domains section).
 *
 * Actual format (biome 2.4.13):
 *   ...
 *   Domains
 *
 *   - Name: react
 *   - The rule is recommended for this domain
 *   ...
 *   - Name: next
 *   ...
 *
 *   Description
 *   ...
 */
const parseDomainsFromExplanation = (explanation) => {
    const lines = explanation.split('\n');
    // Find the index of the "Domains" section header (a standalone capitalized word on its own line)
    let domainsStartIndex = -1;
    for (let index = 0; index < lines.length; index++) {
        if (lines[index].trim() === 'Domains') {
            domainsStartIndex = index;
            break;
        }
    }
    if (domainsStartIndex === -1) {
        return [];
    }

    const domains = [];
    // Scan lines after the "Domains" header; stop at the next section header
    // (a line that is a standalone capitalized word, preceded by a blank line)
    for (let index = domainsStartIndex + 1; index < lines.length; index++) {
        const line = lines[index];
        const trimmed = line.trim();

        // Section header detection: blank line followed by a capitalized word on its own line
        if (trimmed === '' && index + 1 < lines.length) {
            const nextTrimmed = lines[index + 1].trim();
            if (/^[A-Z][a-zA-Z\s]+$/.test(nextTrimmed) && nextTrimmed !== 'Domains') {
                break; // Next section starts
            }
        }

        // Match "- Name: <domain>" lines. Domain names are single words (react, next, test, qwik…).
        // Use \S+ to avoid polynomial-backtracking warnings from regexp/no-super-linear-backtracking
        // (the rule flags patterns where \s+ and .+ can exchange characters).
        const nameMatch = trimmed.match(/^- Name: (\S+)$/i);
        if (nameMatch) {
            domains.push(nameMatch[1].toLowerCase());
        }
    }
    return domains;
};

const SCHEMA_CATEGORIES = [
    'Suspicious',
    'Style',
    'Complexity',
    'Correctness',
    'Security',
    'Performance',
    'Nursery',
    'A11y'
];

for (const categoryName of SCHEMA_CATEGORIES) {
    const categoryDefinition = schema.$defs[categoryName];
    if (!categoryDefinition) {
        continue;
    }
    for (const ruleName of Object.keys(categoryDefinition.properties ?? {})) {
        if (ruleName === 'recommended' || ruleName === 'all') {
            continue;
        }
        let explanation;
        try {
            explanation = execFileSync(biomeBinary, ['explain', ruleName], { encoding: 'utf8' });
        } catch {
            continue; // rule name not explainable in this biome version
        }
        const ruleDomains = parseDomainsFromExplanation(explanation);
        const intersecting = ruleDomains.filter((domain) => OUR_DOMAINS.has(domain));
        if (intersecting.length > 0) {
            domainRules[`${categoryName.toLowerCase()}/${ruleName}`] = { domains: intersecting };
        }
    }
}

const output = {
    biomeVersion: '2.4.13',
    generatedAt: '2026-06-07',
    note: 'regenerate after biome bumps: node __tests__/parity/generate-biome-domain-rules.js',
    rules: domainRules
};
// eslint-disable-next-line security/detect-non-literal-fs-filename -- PACKAGE_ROOT is a build-time constant derived from import.meta.dirname, not user input
writeFileSync(
    path.join(PACKAGE_ROOT, '__tests__', 'parity', 'biome-domain-rules.json'),
    `${JSON.stringify(output, null, 4)}\n`
);
console.log(`wrote ${Object.keys(domainRules).length} domain-activated rules`);
