# Maintenance Guide

How to update @37bytes/code-style when new versions of tools are released.

**Key principle**: ESLint is the source of truth. OxLint and Biome are mirrors. New rules go into ESLint first, then get mirrored to OxLint/Biome if equivalents exist.

---

## ESLint Plugin Updates

ESLint plugins are the primary source of rules. When a plugin releases a new version:

### Steps

1. Bump version in `dependencies` (package.json)
2. Read the plugin's changelog — look for new rules, renamed rules, removed rules
3. Review new rules via wizard pattern (one by one, decide on severity)
4. Add accepted rules to the appropriate `eslint/rules/*.js` file
5. Check if the new rule has an OxLint or Biome equivalent:
    - **OxLint**: check `npx oxlint --rules | grep rule-name`
    - **Biome**: check [Biome rules reference](https://biomejs.dev/linter/rules/) or the JSON Schema
6. If equivalent exists — add to `oxlint/rules/*.js` and/or `biome/rules/*.js`
7. Run builds: `npm run build:oxlint && npm run build:biome`
8. Run tests: `npm test`

### Plugin-specific notes

| Plugin | Rules file | Notes |
| --- | --- | --- |
| eslint-plugin-unicorn | `eslint/rules/javascript.js`, `browser.js` | Rules distributed by domain, not in separate file |
| eslint-plugin-sonarjs | `eslint/rules/quality.js` | v4 API — many rule names changed from v3 |
| eslint-plugin-regexp | `eslint/rules/regexp.js` | All regex rules consolidated here |
| eslint-plugin-perfectionist | `eslint/rules/perfectionist.js` | Opt-in, NOT in recommended |
| eslint-plugin-storybook | `eslint/rules/storybook.js` | NOT in recommended |
| @next/eslint-plugin-next | `eslint/rules/nextjs.js` | NOT in recommended |
| eslint-plugin-n | `eslint/rules/node.js` | Three exports: `node`, `nodeCjs`, `nodeStrict` |
| @typescript-eslint | `eslint/rules/typescript.js` | Check if OxLint tsgolint added equivalents |
| eslint-plugin-react-hooks | `eslint/rules/react-compiler.js` | React Compiler rules (v7+) |

---

## OxLint Updates

OxLint mirrors ESLint rules. When a new OxLint version is released:

### Steps

1. Bump version in `peerDependencies` and `devDependencies`
2. Read the OxLint changelog — look for:
    - **New rules** that we use in ESLint → move from "stays ESLint-only" comments to active rules
    - **New type-aware rules** in tsgolint → add to `type-aware-overrides.js`
    - **Renamed/removed rules** → schema validation will catch these
3. Run `npm run build:oxlint` — validates all rule names via `oxlint --rules`
4. If validation fails — fix rule names in `oxlint/rules/*.js`
5. Run tests: `npm test`

### Where to look for new rules

Check the "stays ESLint-only" comments in each `oxlint/rules/*.js` file. These document rules that didn't exist in OxLint at the time of writing. When OxLint adds support, move the comment to an active rule.

Example — if OxLint adds `import/order`:

```js
// Before (imports.js):
// import/order — not available in OxLint, stays ESLint-only

// After:
'import/order': 'warn',
```

### Schema validation

`build.js` parses `npx oxlint --rules` output and validates every rule name. If a rule was renamed or removed in a new version, the build will fail with:

```
Rule validation failed in base rules:
  ✗ old-rule-name
```

Fix the rule name and rebuild.

### Name mapping reference

| ESLint                   | OxLint                         |
| ------------------------ | ------------------------------ |
| `@typescript-eslint/foo` | `typescript/foo`               |
| `import-x/foo`           | `import/foo`                   |
| `@next/next/foo`         | `nextjs/foo`                   |
| `n/foo`                  | `node/foo`                     |
| `react-hooks/foo`        | `react/foo` (merged namespace) |
| `unicorn/foo`            | `unicorn/foo` (same)           |
| `sonarjs/foo`            | `sonarjs/foo` (jsPlugin)       |
| `regexp/foo`             | `regexp/foo` (jsPlugin)        |

### Type-aware overrides

When tsgolint adds new type-aware rules that we use:

1. Add to `oxlint/rules/typescript.js`
2. Add corresponding disable to `oxlint/type-aware-overrides.js`
3. Check [tsgolint repo](https://github.com/oxc-project/tsgolint) for supported rules

---

## Biome Updates

Biome mirrors ESLint rules. When a new Biome version is released:

### Steps

1. Bump version in `peerDependencies`
2. Delete `.schema-cache.json` in `biome/` (forces re-download of new schema)
3. Read the Biome changelog — look for:
    - **Graduated nursery rules** → move from `nursery` category to the appropriate stable category
    - **New rules** with ESLint equivalents → add to `biome/rules/*.js` + update `biome/eslint-overrides.js`
    - **Renamed/removed rules** → schema validation will catch these
4. Run `npm run build:biome` — validates all rule names against Biome JSON Schema
5. If validation fails — fix rule names in `biome/rules/*.js`
6. Run tests: `npm test`

### Nursery graduation

Biome rules start in `nursery` category and graduate to stable categories (suspicious, style, complexity, etc.). When a rule graduates:

```js
// Before (javascript.js):
export const javascriptNursery = {
    nursery: {
        noProto: 'warn' // was nursery, now graduated
    }
};

// After — move to the stable export:
export const javascript = {
    suspicious: {
        noProto: 'warn' // graduated from nursery
    }
};
```

Also update `biome/eslint-overrides.js` — move the override from nursery section to the appropriate section.

### ESLint bridge maintenance

The `biome/eslint-overrides.js` file disables ESLint rules covered by our Biome config but NOT disabled by `eslint-config-biome` (the static bridge). When adding new Biome rules:

1. Check if `eslint-config-biome` already disables the ESLint equivalent
2. If not — add to `biome/eslint-overrides.js`
3. When `eslint-config-biome` releases a new version — re-check if some of our manual overrides are now covered by the bridge (and can be removed)

### Schema validation

`build.js` downloads the Biome JSON Schema for the version specified in `peerDependencies` and validates all rule names. The schema is cached at `biome/.schema-cache.json`.

- Delete the cache file when bumping Biome version
- If schema URL is unreachable, build warns but continues (offline-safe)

### Biome config format quirks

- Rule options use `{ level: 'warn', options: { ... } }` (NOT ESLint's `['warn', { ... }]`)
- Naming: `CONSTANT_CASE` (not `UPPER_CASE`)
- Formatter config: `javascript: { formatter: { ... } }` (not `formatter.javascript`)

---

## Adding a Completely New ESLint Plugin

When evaluating a new plugin for inclusion:

1. Review all rules via wizard pattern (one by one)
2. Create `eslint/rules/<plugin-name>.js` — or distribute into existing files if few rules
3. Add plugin to `dependencies` in package.json
4. Add config to `eslint/config.js` if needed
5. Update `eslint/rules/index.js` with new exports
6. Check OxLint support: does OxLint have a native plugin or jsPlugin bridge?
7. Check Biome support: does Biome have equivalent rules?
8. Mirror supported rules to `oxlint/rules/` and `biome/rules/`
9. Update builds: `npm run build:oxlint && npm run build:biome`
10. If OxLint/Biome cover the rule — update bridge files (`type-aware-overrides.js`, `eslint-overrides.js`)
11. Update `AGENTS.md` architecture tree
12. Update `docs/roadmap.md` with the addition
13. Run `npm test`

---

## Quick Reference: Build Commands

```bash
npm run build:oxlint    # rebuild oxlint/config.json + validate rules
npm run build:biome     # rebuild biome/config.json + validate rules
npm test                # run all tests (162 tests)
npm run lint            # self-lint the package
```

## Quick Reference: Key Files

| What             | ESLint              | OxLint                     | Biome                     |
| ---------------- | ------------------- | -------------------------- | ------------------------- |
| Rule definitions | `eslint/rules/*.js` | `oxlint/rules/*.js`        | `biome/rules/*.js`        |
| Build script     | —                   | `oxlint/build.js`          | `biome/build.js`          |
| Generated config | —                   | `oxlint/config.json`       | `biome/config.json`       |
| ESLint bridge    | —                   | `type-aware-overrides.js`  | `eslint-overrides.js`     |
| Infrastructure   | —                   | `oxlint/infrastructure.js` | `biome/infrastructure.js` |
| Consumer exports | `eslint/index.js`   | `oxlint/index.js`          | `biome/index.js`          |
