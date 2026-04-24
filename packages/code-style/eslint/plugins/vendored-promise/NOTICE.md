# NOTICE

This directory contains vendored source code from [`eslint-plugin-promise@7.2.1`](https://github.com/eslint-community/eslint-plugin-promise/tree/v7.2.1), licensed under ISC (see `LICENSE.md`).

**Why vendored:** As of 2026-04, the upstream `eslint-plugin-promise` package is effectively unmaintained. Its peer dependency range caps at `eslint@^9.0.0`, blocking consumers from upgrading to ESLint 10. PR [#617](https://github.com/eslint-community/eslint-plugin-promise/pull/617) adding ESLint 10 support has been open since 2026-02-08 with no maintainer response, and the last release was 7.2.1 on 2024-11-27. We vendored the 5 rules we use (`prefer-await-to-then`, `no-return-in-finally`, `no-multiple-resolved`, `no-callback-in-promise`, `spec-only`) to unblock our ESLint 10 migration while preserving the same rule IDs (`promise/*`) for parity with our oxlint/biome configs.

**Removal plan:** When upstream releases `eslint-plugin-promise@7.3+` with `eslint: ^10` peer support, we switch back to the upstream package and delete this directory. Tracked in `docs/tech-debt.md`.
