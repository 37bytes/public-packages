# OxLint Maintenance Guide

OxLint config is **separate** from ESLint — different rule names, different plugin system, different subset of rules. There is no automatic sync between the two. Changes must be made manually in both places.

## How the build works

```
oxlint/rules/*.js  ──┐
                      ├──► build.js ──► config.json ──► .oxlintrc.json (copy)
infrastructure.js  ──┘         └────► perfectionist.json
```

- `npm run build:oxlint` runs `build.js`, then `prettier --write` on output files
- `build.js` validates all rule names against `oxlint --rules` output — typos are caught at build time
- `config.json` is committed to git (consumers read it directly)
- `.oxlintrc.json` at repo root is a copy of `config.json` (needed for `jsPlugins` path resolution during dogfooding)
- `prepublishOnly` runs `build:oxlint` automatically

## Adding a rule

1. Find the right file in `oxlint/rules/` (mirrors `eslint/rules/` by category)
2. Add the rule with OxLint name (see [Name mapping](#name-mapping) below)
3. Run `npm run build:oxlint` — rebuilds `config.json`
4. If adding to ESLint too — update the corresponding `eslint/rules/*.js` file
5. If the rule is type-aware — also add to `type-aware-overrides.js` so ESLint skips it in hybrid mode

## Removing a rule

1. Delete from `oxlint/rules/*.js`
2. Run `npm run build:oxlint`
3. If the rule was in `type-aware-overrides.js` — remove from there too

## Name mapping

OxLint uses different prefixes than ESLint:

| ESLint                   | OxLint                              |
| ------------------------ | ----------------------------------- |
| `@typescript-eslint/foo` | `typescript/foo`                    |
| `import-x/foo`           | `import/foo`                        |
| `@next/next/foo`         | `nextjs/foo`                        |
| `n/foo`                  | `node/foo`                          |
| `unicorn/foo`            | `unicorn/foo` (same)                |
| `react/foo`              | `react/foo` (same)                  |
| `react-hooks/foo`        | `react/foo` (merged into react)     |
| `sonarjs/foo`            | `sonarjs/foo` (same, via jsPlugin)  |
| `regexp/foo`             | `regexp/foo` (same, via jsPlugin)   |
| `@37bytes/foo`           | `@37bytes/foo` (same, via jsPlugin) |

## What OxLint cannot cover

These stay ESLint-only:

- **`@37bytes/boolean-naming`** — requires TypeScript type info
- **`@typescript-eslint/naming-convention`** — not implemented in tsgolint
- **`eslint-plugin-n`** — only 5 of 34 rules available in OxLint
- **`import-x/no-cycle`**, **`import-x/no-internal-modules`** — not in OxLint
- **FSD rules** (`import-x/no-restricted-paths`) — project-specific, ESLint only
- **`no-restricted-imports`** — project-specific, ESLint only
- **testing-library**, **jest-dom**, **react-compiler**, **eslint-plugin-security** — no OxLint equivalents

## Hybrid mode (OxLint + tsgolint + ESLint)

Three layers of deduplication:

1. **`eslint-plugin-oxlint`** — reads `config.json`, disables AST rules in ESLint (~227 rules)
2. **`type-aware-overrides.js`** — disables type-aware rules covered by tsgolint (10 rules)
3. **ESLint runs the rest** — naming-convention, boolean-naming, FSD, n/, import-x advanced, etc.

### Consumer setup

```bash
# Step 1: OxLint (AST + type-aware via tsgolint) — fast
oxlint -c node_modules/@37bytes/code-style/oxlint/config.json --type-aware .

# Step 2: ESLint (only what OxLint can't cover) — slower but minimal
eslint .
```

```js
// eslint.config.mjs
import { recommendedNextjs } from '@37bytes/code-style/eslint';
import { typeAwareOverrides } from '@37bytes/code-style/oxlint/type-aware-overrides';
import oxlint from 'eslint-plugin-oxlint';

export default [
    ...recommendedNextjs,
    // ... other configs (FSD, restricted-imports, etc.)

    // Layer 1: disable AST rules covered by oxlint
    ...oxlint.buildFromOxlintConfigFile('node_modules/@37bytes/code-style/oxlint/config.json'),
    // Layer 2: disable type-aware rules covered by tsgolint
    typeAwareOverrides
];
```

### Maintaining type-aware-overrides.js

Only include rules that are **both**:

- Present in our `eslint/rules/typescript.js`
- Implemented in tsgolint (check the [tsgolint repo](https://github.com/oxc-project/tsgolint))

When tsgolint adds new rules we use, add them to `type-aware-overrides.js`.

## Performance benchmarks

Tested on real project (652 files, Next.js + FSD):

| Setup                      | Errors | Warnings | Time   |
| -------------------------- | ------ | -------- | ------ |
| ESLint only (37bytes)      | 665    | 348      | 14.8s  |
| OxLint only                | 222    | 313      | 2.0s   |
| **Hybrid (OxLint+ESLint)** | 473    | 109      | ~6.0s  |
| Biome only                 | 263    | 514      | 0.9s   |
| Biome + ESLint hybrid      | 405    | 336      | ~14.0s |

OxLint hybrid wins — it covers type-aware `no-unsafe-*` rules via tsgolint, letting ESLint skip the expensive type-checker. Biome hybrid gives no speedup because ESLint type-checker still loads for `no-unsafe-*`.

## Verification checklist

After any change to OxLint rules:

```bash
npm run build:oxlint                    # rebuild config.json
npm run lint                            # self-lint passes
npm test                                # all tests pass
oxlint -c .oxlintrc.json <project>      # validate on real project
oxlint -c .oxlintrc.json --type-aware <project>  # with tsgolint
```

## File reference

| File                             | Purpose                                 | Editable?    |
| -------------------------------- | --------------------------------------- | ------------ |
| `oxlint/rules/*.js`              | Rule definitions (source of truth)      | Yes          |
| `oxlint/infrastructure.js`       | Plugins, env, schema, override patterns | Yes          |
| `oxlint/build.js`                | Assembler script                        | Rarely       |
| `oxlint/config.json`             | Generated output                        | No (rebuild) |
| `oxlint/perfectionist.json`      | Generated output                        | No (rebuild) |
| `.oxlintrc.json`                 | Copy of config.json                     | No (rebuild) |
| `oxlint/type-aware-overrides.js` | ESLint overrides for hybrid mode        | Yes          |
| `oxlint/index.js`                | Package exports                         | Rarely       |
