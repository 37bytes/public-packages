# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
