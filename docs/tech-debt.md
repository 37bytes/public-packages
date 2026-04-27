# Tech Debt

## `eslint-plugin-jest-dom` removed (ESLint 10 migration)

**When:** 2026-04-24 (landed in code-style 0.0.3 release).

**What was lost:** 10 `jest-dom/prefer-*` matcher autofix rules (e.g. `.toBeChecked()` suggestion instead of `.toHaveAttribute('aria-checked', 'true')`). Non-critical, warn-level only.

**Why:** `eslint-plugin-jest-dom@5.5.0` caps peer at `eslint@^9`. Upstream ESLint 10 support is merged to main (PR #416, 2026-02-08) but unreleased due to a broken semantic-release pipeline ([issue #417](https://github.com/testing-library/eslint-plugin-jest-dom/issues/417)).

**Restoration plan:** Monitor `npm view eslint-plugin-jest-dom peerDependencies.eslint`. When it includes `^10`, re-add the plugin as a patch release of `@37bytes/code-style` (restore `testing.js` exports and `testingReactConfig` block). See git log around 2026-04-24 for the removal commit.

## `eslint-plugin-promise` vendored in-tree (ESLint 10 migration)

**When:** 2026-04-24 (landed in code-style 0.0.3 release).

**What was vendored:** 5 rules (`prefer-await-to-then`, `no-return-in-finally`, `no-multiple-resolved`, `no-callback-in-promise`, `spec-only`) + 10 shared helpers, copied from `eslint-plugin-promise@7.2.1` and converted to ESM. Location: `packages/code-style/eslint/plugins/vendored-promise/`.

**Why:** Upstream `eslint-plugin-promise` still caps peer at `eslint@^9`. PR [#617](https://github.com/eslint-community/eslint-plugin-promise/pull/617) adding ESLint 10 support has been open since 2026-02-08 with no maintainer response. Last release was 7.2.1 on 2024-11-27. Vendoring preserves the same `promise/*` rule IDs for parity with our oxlint/biome configs.

**Restoration plan:** When upstream releases `eslint-plugin-promise@7.3+` with `eslint: ^10` peer support, switch back to the upstream package and delete the vendored directory.

## `peerDependencies.typescript` capped to 6.x (TypeScript 7 Native Preview)

**When:** 2026-04-27. TypeScript 7.0 Beta announced 2026-04-21 ([blog post](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/)), distributed as `@typescript/native-preview` with the `tsgo` binary.

**What is blocked:** `@typescript-eslint/parser@8.59.0` peer caps at `typescript: ">=4.8.4 <6.1.0"`. Even after relaxing the peer cap, type-aware ESLint rules call into the TypeScript Compiler JS API (`ts.createProgram`, `Program.getTypeChecker`); per the announcement, "we won't have a stable programmatic API available until at least several months from now with TypeScript 7.1". Until then, type-aware rules from `@typescript-eslint/*` and the type-aware subset of `@eslint-react` cannot run on TS 7.

**Workaround in place:** Side-by-side use is supported. Consumer keeps `typescript@6.x` for ESLint type-aware rules and editor support, and adds `@typescript/native-preview@beta` for fast `tsgo --noEmit` in CI. Documented in `packages/code-style/README.md` under "TypeScript 7 (Native Preview)". Our `oxlint-tsgolint` dep already provides Go-native type-aware linting, independent of the TS JS API.

**Restoration plan:** When TypeScript 7.1 ships with a stable programmatic API and `@typescript-eslint` releases a version that supports it, expand `peerDependencies.typescript` (likely to `">=6.0.0 <8.0.0"` or similar) and update the README to drop the side-by-side recipe.
