# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- **BREAKING:** `nodeEnvOverride.files` whitelist tightened and clarified. Was `['**/env.js', '**/env.ts', '**/env.config.*']`. Now `['**/env.{js,ts,mjs,cjs}', '**/environment.{js,ts,mjs,cjs}']`. The override now follows a strict naming convention: if a file needs to read `process.env`, name it `env.{js,ts,mjs,cjs}` or `environment.{js,ts,mjs,cjs}`. The previous `**/env.config.*` pattern is dropped (use `env.ts`/`environment.ts` instead). Multi-file env-loaders (e.g. `getAppEnvironment.ts`, `getBuildTimeEnvironment.ts`) are not whitelisted by default — consumers either rename to fit the convention, merge into a single file, or extend the override locally in their flat config.
- `nodeEnvOverride.rules` now relaxes four rules instead of one. Previously only `n/no-process-env` was disabled in env-loader files. Now also disables `no-console`, `n/no-process-exit`, and `security/detect-non-literal-fs-filename`. These cover the standard bootstrap pattern: schema-validate `process.env`, log validation errors to `console.error` (logger not yet initialized), `process.exit(1)` on failure, and read `.env.${envName}` files where `envName` is operator-controlled (NODE_ENV / CLI args, not user input). Not breaking — strictly relaxing.
- **BREAKING:** Factory exports renamed to follow `create*` convention:
    - `fsdConfig` → `createFSDConfig` (`@37bytes/code-style/eslint/fsd`)
    - `restrictedImportsConfig` → `createRestrictedImportsConfig` (`@37bytes/code-style/eslint/restricted-imports`)

    Old names removed without alias. Consumers must update imports and call sites:

    ```diff
    - import { fsdConfig, restrictedImportsConfig } from '@37bytes/code-style/eslint';
    + import { createFSDConfig, createRestrictedImportsConfig } from '@37bytes/code-style/eslint';

      export default [
          ...spa,
    -     ...fsdConfig({ allowPatterns: ['next/*'] }),
    -     ...restrictedImportsConfig()
    +     ...createFSDConfig({ allowPatterns: ['next/*'] }),
    +     ...createRestrictedImportsConfig()
      ];
    ```

    Rationale: the previous names looked like ready-made config objects; consumers occasionally spread them without invoking, producing an opaque `TypeError: Unexpected function` from `@eslint/config-array`. The `create*` prefix makes the factory nature explicit.

## 0.0.3 (2026-04-27)

### Added

- ESLint 10 support: peer bumped from `9.39.4` to `^10.0.0`.
- Migrated React rules to `@eslint-react/eslint-plugin@4.2.3`, replacing `eslint-plugin-react` (which still caps at `eslint@^9`).
- Vendored 5 rules from `eslint-plugin-promise@7.2.1` into `eslint/plugins/vendored-promise/` (upstream unmaintained, PR #617 open since 2026-02-08 with no maintainer response). Same `promise/*` rule IDs preserved for oxlint/biome parity.
- Restored three JSX stylistic rules that were lost during the React migration (`@eslint-react` intentionally drops stylistic rules):
    - `@stylistic/jsx-curly-brace-presence` from new dep `@stylistic/eslint-plugin@5.10.0`. Behaviour identical to old `react/jsx-curly-brace-presence` with option `'never'`.
    - `@37bytes/jsx-boolean-value` new local plugin. Forbids explicit `={true}` on JSX boolean props. Equivalent to old `react/jsx-boolean-value` with option `'never'`.
    - `@37bytes/jsx-fragments` new local plugin. Prefers shorthand `<>...</>` over `<React.Fragment>...</React.Fragment>`. Equivalent to old `react/jsx-fragments` with option `'syntax'`.

### Changed

- **BREAKING:** React rule IDs changed across the board (`eslint-plugin-react` → `@eslint-react/eslint-plugin`). Downstream `// eslint-disable-next-line react/X` comments must be rewritten. Full mapping below.
- **BREAKING:** `engines.node` implicitly requires a Node version ESLint 10 supports (`^20.19 || ^22.13 || >=24`). Our `>=24.0.0` is a stricter subset, but consumers on older Node need to upgrade.
- `eslint-plugin-react-hooks` 7.0.1 → 7.1.1 (for ESLint 10 peer support).
- Dependency refresh sweep:
    - `@biomejs/biome` 2.4.10 → 2.4.13 (peer + dev), `prettier` 3.8.1 → 3.8.3 (peer + dev), `typescript` 6.0.2 → 6.0.3 (peer + dev).
    - `@typescript-eslint/eslint-plugin`, `parser`, `utils` 8.58.0 → 8.59.0.
    - `@next/eslint-plugin-next` 16.2.2 → 16.2.4, `@vitest/eslint-plugin` 1.6.14 → 1.6.16, `eslint-plugin-perfectionist` 5.8.0 → 5.9.0, `eslint-plugin-sonarjs` 4.0.2 → 4.0.3, `eslint-plugin-storybook` 10.3.4 → 10.3.5, `globals` 17.4.0 → 17.5.0.
    - `oxlint` 1.58.0 → 1.61.0 (peer + dev), `eslint-plugin-oxlint` 1.58.0 → 1.61.0, `oxlint-tsgolint` 0.19.0 → 0.22.0.
    - `stylelint` 17.6.0 → 17.9.0 (peer + dev), `stylelint-order` 7.0.1 → 8.1.1 (additive major: CSS-in-JS interpolation autofix + new `custom-properties-alphabetical-order` rule).

### Removed

- **BREAKING:** `eslint-plugin-jest-dom` removed. 10 `jest-dom/prefer-*` matcher autofix rules lost. Reason: upstream peer caps at `eslint@^9`; ESLint 10 support is merged to main (PR #416) but unreleased due to broken CI (issue #417). Tracked in `docs/tech-debt.md`. Will be restored as a patch release when upstream releases.
- **BREAKING:** `eslint-plugin-react` no longer a direct dep (replaced by `@eslint-react/eslint-plugin`).
- **BREAKING:** These `react/*` rules were dropped without a new-plugin replacement (covered by other means or intentionally not ported):
    - `react/function-component-definition` (covered by `prefer-arrow-functions`)
    - `react/jsx-no-undef` (covered by `no-undef` + TypeScript)
    - `react/no-typos` (covered by TypeScript)
    - `react/jsx-pascal-case` (covered by parser + TypeScript)
    - `react/no-is-mounted` (legacy createClass, obsolete)
    - `react/sort-comp` (class components, obsolete)
    - `react/jsx-handler-names` (stylistic, intentionally dropped)
    - `react/no-adjacent-inline-elements` (edge a11y, intentionally dropped)
    - `react/boolean-prop-naming` (covered by local `@37bytes/boolean-naming` — type-aware, stricter)
    - `react/hook-use-state` (partial overlap with `@eslint-react/use-state`, not enabled)
    - `react/self-closing-comp` (covered by Prettier)
    - `react/jsx-curly-newline` (covered by Prettier)
    - `react/jsx-no-duplicate-props` (covered by TypeScript TS17001)

### Migration Guide

For consumers: replace old rule IDs with new ones in `// eslint-disable` comments and any local overrides. Find-and-replace map (note the **flat kebab-case** in `@eslint-react/<name>` — the plugin documentation site groups rules under `dom/`, `jsx/`, `web-api/` categories but the actual rule IDs use `dom-<name>`, `jsx-<name>`, not `dom/<name>`):

| Old | New |
| --- | --- |
| `react/jsx-key` | `@eslint-react/no-missing-key` (also: `@eslint-react/no-duplicate-key`, `@eslint-react/jsx-no-key-after-spread`) |
| `react/no-array-index-key` | `@eslint-react/no-array-index-key` |
| `react/jsx-no-leaked-render` | `@eslint-react/no-leaked-conditional-rendering` |
| `react/jsx-no-comment-textnodes` | `@eslint-react/jsx-no-comment-textnodes` |
| `react/no-unknown-property` | `@eslint-react/dom-no-unknown-property` |
| `react/no-direct-mutation-state` | `@eslint-react/no-direct-mutation-state` |
| `react/no-access-state-in-setstate` | `@eslint-react/no-access-state-in-setstate` |
| `react/no-unused-state` | `@eslint-react/no-unused-state` |
| `react/no-danger-with-children` | `@eslint-react/dom-no-dangerously-set-innerhtml-with-children` |
| `react/no-children-prop` | `@eslint-react/jsx-no-children-prop` |
| `react/no-unstable-nested-components` | `@eslint-react/no-nested-component-definitions` |
| `react/no-object-type-as-default-prop` | `@eslint-react/no-unstable-default-props` |
| `react/style-prop-object` | `@eslint-react/dom-no-string-style-prop` |
| `react/button-has-type` | `@eslint-react/dom-no-missing-button-type` |
| `react/no-danger` | `@eslint-react/dom-no-dangerously-set-innerhtml` |
| `react/jsx-no-script-url` | `@eslint-react/dom-no-script-url` |
| `react/iframe-missing-sandbox` | `@eslint-react/dom-no-missing-iframe-sandbox` |
| `react/jsx-no-target-blank` | `@eslint-react/dom-no-unsafe-target-blank` |
| `react/no-deprecated` | `@eslint-react/no-component-will-mount`, `@eslint-react/no-component-will-receive-props`, `@eslint-react/no-component-will-update`, `@eslint-react/dom-no-hydrate`, `@eslint-react/dom-no-render`, `@eslint-react/no-context-provider`, `@eslint-react/no-forward-ref` |
| `react/jsx-curly-brace-presence` | `@stylistic/jsx-curly-brace-presence` |
| `react/jsx-boolean-value` | `@37bytes/jsx-boolean-value` |
| `react/jsx-fragments` | `@37bytes/jsx-fragments` |

**oxlint/biome parity note:** oxlint retains the old `react/*` rule IDs from `eslint-plugin-react` (they are built-in). Semantic coverage is the same; only rule IDs differ between the ESLint config and the oxlint/biome configs. This is an intentional trade-off.

## 0.0.2 (2026-04-05)

### Added

- New `tool` ESLint preset for CLI utilities (extends `nodejs`, disables `n/no-process-exit` and `security/detect-non-literal-fs-filename`)
- `perfectionist.tool` variant

### Changed

- **BREAKING:** TypeScript 5.9.3 -> 6.0.2
- **BREAKING:** Removed `noUncheckedIndexedAccess` from TypeScript base preset
- eslint-plugin-unicorn 63 -> 64
- oxlint 1.50 -> 1.58, biome 2.4.4 -> 2.4.10
- @typescript-eslint 8.56 -> 8.58
- eslint-plugin-perfectionist 5.6 -> 5.8, eslint-plugin-regexp 3.0 -> 3.1
- Minor/patch bumps for all other ESLint plugins and tooling
- ESLint 9.39.2 -> 9.39.4 (ESLint 10 deferred: blocked by react, react-hooks, promise, jest-dom plugins)

### Removed

- `unicorn/prefer-json-parse-buffer` rule

### Fixed

- `setupGitHooks.mjs`: fixed named import of `process` (should be default import)

## 0.0.1 (2026-03-05)

Initial release. ESLint flat configs (spa, nextjs, nodejs), custom @37bytes plugins (4), OxLint/Biome alternative configs, Stylelint config for CSS/SCSS modules, Prettier config, TypeScript presets, EditorConfig.
