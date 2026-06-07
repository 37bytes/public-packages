# @37bytes/code-style — agent guide

Shareable lint/format config. **eslint flat presets are the source of truth**; biome and oxlint configs are parallel hand-written trees that must mirror it. The parity test suite (884 tests) enforces this; if your change turns it red, the red names the exact rule and direction.

## Which file to touch

| You want to | Touch | Then |
|---|---|---|
| Change a rule for everyone | `eslint/rules/<domain>.js` | mirror in `biome/rules/<domain>.js` + `oxlint/rules/<domain>.js` if equivalents exist; regenerate; `pnpm test:parity` |
| Change biome/oxlint only | don't | policy is promotion-first: norms live in eslint, tools only mirror. Tool-only rules get trimmed by the parity reverse check |
| Map a new rule pair | `__tests__/parity/rule-equivalence.js` | add a unit test in `rule-equivalence.check.js`; biome side is a full manual table (kebab vs camelCase, no automatic transform exists) |
| Accept a genuine engine gap | `__tests__/parity/known-gaps.js` | entry needs `reason` with date + tool versions, optional `tools: ['biome'\|'oxlint']` scoping. Drift is never allowlisted, only true engine absences |
| Change preset composition/globs | `eslint/config.js` | add a fixture file under `__tests__/fixtures/parity/<preset>/` exercising the new glob (Layer 2 only sees represented files) |
| Change graph rules (dependency-cruiser) | `dependency-cruiser/{base,fsd}.js` | OUTSIDE the parity domain: biome/oxlint have no graph-rule analogues, promotion-first does not apply. Behavioural fixtures: `__tests__/fixtures/{cruise-base-project,fsd-cruise-project}` |

## Sync workflow (any rule change)

1. Edit `eslint/rules/<domain>.js` (severity truth lives here).
2. Mirror in `biome/rules/` and/or `oxlint/rules/` using the inline `biome -> eslint` comment convention.
3. Regenerate: `pnpm build:oxlint` and/or `pnpm build:biome`. Never edit `oxlint/config.json`, `.oxlintrc.json`, `biome/config.json` by hand; `.oxlintrc.json` must stay byte-identical to `oxlint/config.json`.
4. If rule names differ across engines: add/extend the mapping in `__tests__/parity/rule-equivalence.js` + unit test.
5. `pnpm test:parity` (fast, ~10s) until green, then full `pnpm test`.

## Dependency bump protocol

1. Bump versions (exact pins; oxlint/biome/stylelint are ALSO peerDependencies, update both spots; `oxlint` and `eslint-plugin-oxlint` move in lockstep).
2. biome: regenerate via `pnpm build:biome` (schema cache is version-keyed) and `pnpm build:parity-domains` (re-stamps `__tests__/parity/biome-domain-rules.json`).
3. oxlint: `pnpm build:oxlint`. Rule-name validation reads `node_modules/oxlint/configuration_schema.json` (NOT `oxlint --rules`; that stopped emitting a parseable table in 1.68).
4. Expect parity reds: that is the bump-diff, the suite's payoff. Resolve each per promotion-first (newly available tool rule whose eslint twin is enabled: enable + map; genuinely absent: dated known-gaps entry). Known traps: oxlint diagnostic code prefixes change between versions (`eslint-plugin-next(...)` became `next(...)` in 1.68; `parseOxlintCode` in `parity-presets.check.js` is the tripwire and fails loudly via the `unknownOxlintCodeFormats` guard).
5. dependency-cruiser: rerun `node --test __tests__/dependency-cruiser-*.test.js`. The behavioural fixtures pin exact violation sets; a bump that changes them is the diff to triage. Known engine guards: safe-regex rejects nested quantifiers; tsPreCompilationDeps=true is load-bearing (TS elides unused imports otherwise); never add includeOnly to preset options (breaks required-rules and not-to-unresolvable).

## Test layout (load-bearing, do not "simplify")

- Root `pnpm test` uses EXPLICIT globs, not bare `node --test`: Node 24 auto-discovery would otherwise pick up fixture `.test.ts` files and the parity suite's internals. `__tests__/test-discovery.test.js` guards the globs; if you add a `.test.js` outside the globbed dirs, it fails and tells you what to do.
- Parity tests use the `.check.js` extension and run via `pnpm test:parity` (also included in root `test` now that the suite is green).
- `__tests__/fixtures/parity/**` contains INTENTIONALLY violating code, one `// parity: <finding>` annotation per violation. Don't fix the violations; don't strip the annotations. The tree is excluded from `lint:eslint`/`lint:typescript` by the same mechanism as the older fixtures.

## Pre-commit hook gotchas

- The hook runs FULL monorepo lint + tests on every commit (30-60s; slow is normal, do not bypass).
- `lint:eslint` uses `--fix`: changing a shared preset can AUTOFIX files in OTHER packages during your commit. Check `git status` after committing; orphaned autofix fallout in sibling packages must be committed separately with its own scope (e.g. `fix(logstory): ...`), not left dirty and not silently bundled.
- `--max-warnings 0`: a new rule that fires on this package's own code blocks the commit. Fix the code (dogfood) or reconsider the rule; never weaken severity just to pass.

## Commands

| Command | What |
|---|---|
| `pnpm test:parity` | the 884-test parity suite (Layers 1+2 + unit checks) |
| `pnpm build:oxlint` / `pnpm build:biome` | regenerate tool configs from rule trees |
| `pnpm build:parity-domains` | regenerate biome domain-activated rules JSON (after biome bumps) |
| `pnpm test` | full package suite incl. parity |

Design rationale and history: `docs/superpowers/specs/2026-06-06-cross-linter-parity-tests-design.md` (monorepo root), CHANGELOG.md `[Unreleased]`.
