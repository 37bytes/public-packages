# Tech Debt

## `eslint-plugin-jest-dom` removed (ESLint 10 migration)

**When:** 2026-04-24 (code-style 1.0.0 release).

**What was lost:** 10 `jest-dom/prefer-*` matcher autofix rules (e.g. `.toBeChecked()` suggestion instead of `.toHaveAttribute('aria-checked', 'true')`). Non-critical, warn-level only.

**Why:** `eslint-plugin-jest-dom@5.5.0` caps peer at `eslint@^9`. Upstream ESLint 10 support is merged to main (PR #416, 2026-02-08) but unreleased due to a broken semantic-release pipeline ([issue #417](https://github.com/testing-library/eslint-plugin-jest-dom/issues/417)).

**Restoration plan:** Monitor `npm view eslint-plugin-jest-dom peerDependencies.eslint`. When it includes `^10`, re-add the plugin as a patch release of `@37bytes/code-style` (restore `testing.js` exports and `testingReactConfig` block). See git log around 2026-04-24 for the removal commit.

## `eslint-plugin-promise` vendored in-tree (ESLint 10 migration)

**When:** 2026-04-24 (code-style 1.0.0 release).

**What was vendored:** 5 rules (`prefer-await-to-then`, `no-return-in-finally`, `no-multiple-resolved`, `no-callback-in-promise`, `spec-only`) + 10 shared helpers, copied from `eslint-plugin-promise@7.2.1` and converted to ESM. Location: `packages/code-style/eslint/plugins/vendored-promise/`.

**Why:** Upstream `eslint-plugin-promise` still caps peer at `eslint@^9`. PR [#617](https://github.com/eslint-community/eslint-plugin-promise/pull/617) adding ESLint 10 support has been open since 2026-02-08 with no maintainer response. Last release was 7.2.1 on 2024-11-27. Vendoring preserves the same `promise/*` rule IDs for parity with our oxlint/biome configs.

**Restoration plan:** When upstream releases `eslint-plugin-promise@7.3+` with `eslint: ^10` peer support, switch back to the upstream package and delete the vendored directory.
