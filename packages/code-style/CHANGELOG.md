# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.0.4] - 2026-08-19

Оба правила про граф импортов на TypeScript были неработоспособны с самого начала линии: резолвер грузился по имени и зависел от раскладки `node_modules`, а ExportMap не умел парсить `.ts`. Выпуск чинит и то, и другое.

### Fixed

- `import-x/no-cycle`, `import-x/named` и `import-x/no-deprecated` больше не молчат на TypeScript. Эти правила ходят не по AST текущего файла, а по ExportMap: плагин сам открывает импортируемый модуль и парсит его. Без `settings['import-x/parsers']` парсера для `.ts`/`.tsx` у него нет, граф импортов остаётся пустым, и правила не находят ничего, оставаясь при этом включёнными и зелёными. То есть на TS-проектах `no-cycle` был декоративным с самого начала: `0 errors` означало «граф не построен», а не «циклов нет». Добавлен `settings['import-x/parsers'] = { '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'] }`. Ожидаемое следствие: на кодовых базах с реальными циклами импорта пресет теперь краснеет там, где раньше молчал.

- Резолвер TypeScript больше не зависит от раскладки `node_modules`. Пресет задавал его легаси-настройкой `settings['import-x/resolver'] = { typescript: {...} }`, то есть ИМЕНЕМ, а `eslint-plugin-import-x` по имени ищет пакет `eslint-import-resolver-typescript` сначала от линтуемого файла, потом от себя. Пакет объявлен обычной `dependency` пресета, поэтому обе попытки зависели от того, куда пакетный менеджер положил дерево. Когда не попадала ни одна, поиск по имени доходил до фолбэка `require('typescript')`, подтягивал сам компилятор, тот не проходил валидацию интерфейса резолвера, и ESLint выдавал `Resolve error: typescript with invalid interface loaded as resolver` на каждый импорт в каждом файле. Теперь пресет импортирует `createTypeScriptImportResolver` напрямую и отдаёт готовый объект через `settings['import-x/resolver-next']`, документированный API flat config.

### Changed

- **BREAKING:** пресеты задают `settings['import-x/resolver-next']` вместо `settings['import-x/resolver']`. `import-x` отдаёт `resolver-next` строгий приоритет и при его наличии вообще не смотрит в легаси-ключ, поэтому потребительские переопределения вида `settings['import-x/resolver'] = { typescript: { project: '...' } }` перестают действовать МОЛЧА, без предупреждения. Переопределять резолвер теперь нужно тем же ключом: `settings['import-x/resolver-next'] = [createTypeScriptImportResolver({ project: '...' })]`.

- Линт стал дороже. На внутреннем замере (node 26.5.0, три прогона без кеша) время выросло примерно вдвое, и вся разница приходится на `import-x/parsers`: сборка только с фиксом резолвера осталась в пределах шума. Это не регрессия, а стоимость работы, которой раньше не было: ExportMap теперь действительно открывает и парсит каждый импортируемый `.ts`, а не пропускает его. Масштаб на больших кодовых базах не измерялся. Если время линта станет проблемой, точка настройки это `maxDepth` у `import-x/no-cycle`, но это размен на корректность: глубокие циклы правило перестанет видеть.

## [0.0.3] - 2026-08-17

Первый стабильный выпуск линии `0.0.3`, объединяющий изменения prerelease-версий с `0.0.3-dev.0` по `0.0.3-dev.3`. Подробная история prerelease сохранена ниже.

### Added

- Dependency Cruiser presets для базовых архитектурных проверок и FSD 2.1, включая изоляцию слайсов, public API, `@x` cross-imports и server/client markers.
- Role-based Node.js presets (`nodejsRuntime`, `nodejsConfig`, `nodejsTool`), `nextjsServerConfig`, `storybookMainConfig` и `withServerBoundaryFirst`.
- Локальные JSX-правила `@37bytes/jsx-boolean-value` и `@37bytes/jsx-fragments`.

### Changed

- **BREAKING:** ESLint обновлён до 10.x; React rules переведены на `@eslint-react/eslint-plugin`.
- **BREAKING:** `nodejs`, `tool`, `nodeEnvOverride`, `fsdConfig` и `restrictedImportsConfig` заменены role-based и `create*` API без compatibility aliases.
- **BREAKING:** `nextjs` больше не включает server-side relaxations автоматически; consumers добавляют `nextjsServerConfig` явно.
- **BREAKING:** `n/prefer-global/*` переключены на Node globals; импорты `process`, `Buffer`, `URL`, timers и других встроенных runtime objects нужно удалить.
- **BREAKING:** `eslint-plugin-jest-dom` удалён, часть прежних `react/*` rules удалена без прямой замены. Полная карта миграции сохранена в секции `0.0.3-dev.0` ниже.
- TypeScript закреплён на 6.0.3; актуализированы Biome, Oxlint, Stylelint, Prettier и ESLint plugin dependencies.
- Внутренние импорты пакета переведены на native `package.json#imports` aliases и package self-references.

### Fixed

- `createFSDConfig({ dependencyCruiser: true })` сохраняет `import-x/no-internal-modules` и отключает только полные граф-дубли.
- Test harness переносим на Windows: URL paths больше не строятся через `URL.pathname`, package binaries запускаются через `process.execPath` без POSIX `.bin` shims.
- Ошибки resolution/spawn сохраняют исходные `code`, `path` и сообщение вместо маскировки JSON parse error.
- Programmatic ESLint harness отключает automatic single-run inference: `CI=true` больше не включает несовместимый cache mode, который терял type-aware/FSD diagnostics или падал в TypeScript `normalizeSlashes`.
- README installation versions и список custom rules синхронизированы с фактическими package metadata.

## [0.0.3-dev.3] - 2026-07-24

### Fixed

- `createFSDConfig({ dependencyCruiser: true })` no longer drops `import-x/no-internal-modules`. That rule does double duty: it enforces FSD slice public API (which dependency-cruiser mirrors) AND bans deep imports into resolvable external packages (`some-pkg/lib/internal/file`), which nothing in the dependency-cruiser presets covers. Dropping it (as 0.0.3-dev.2 did) silently removed the external-deep-import ban for every file in a consumer that enabled the flag. The flag now removes only the two rules dependency-cruiser fully replaces: `import-x/no-restricted-paths` (layer direction) and `@37bytes/no-slice-self-import`. Side effect: FSD public-API violations are now covered by both eslint (in-editor) and dependency-cruiser (CI), which is redundant signal on an actual violation, not noise on clean code. This also closes a gap where a Next.js top-level `app/` route tree (above the FSD `src/` root, hence outside dependency-cruiser's `^src/`-scoped rules) lost public-API enforcement under the flag.

## [0.0.3-dev.2] - 2026-07-21

### Added

- `createFSDConfig({ dependencyCruiser: true })` option: a lightweight FSD eslint preset for projects that also run `createFsdCruiserConfig` in CI. When set, it drops the graph-expressible boundary rules that dependency-cruiser already enforces (`import-x/no-restricted-paths`, `import-x/no-internal-modules`, `@37bytes/no-slice-self-import`), so the same layer or public-API violation is not reported twice by two tools. It keeps the rules with no graph analogue: `import-x/order`, `@37bytes/no-legacy-folders`, and `require-server-only` / `require-client-only` (eslint pins the marker as the first statement and autofixes it, whereas dependency-cruiser only checks the import exists). The default (`false`) is byte-for-byte unchanged. Pass the flag only if you actually run dependency-cruiser in CI, otherwise layer boundaries go unchecked by anyone.

## [0.0.3-dev.1] - 2026-07-21

### Added

- `@37bytes/code-style/dependency-cruiser`: graph-level lint presets. `createBaseCruiserConfig()` (full dependency-cruiser init set: circulars, orphans, unresolvable, dev-deps-in-prod, etc.) and `createFsdCruiserConfig()` (FSD 2.1 boundaries, 37bytes adaptation: layer matrix, slice isolation with @x cross-imports, public API enforcement, segment isolation, required server-only/client-only markers). Additive to the eslint FSD preset; specifier-level rules stay in eslint. `dependency-cruiser` becomes an optional peerDependency for consumers of this entry point.

- `withServerBoundaryFirst(sortImportsOptions)` export from `@37bytes/code-style/eslint`: idempotently prepends a `server-boundary` group (`server-only` / `client-only` side-effect imports) to a `perfectionist/sort-imports` options object. Consumers who override `sort-imports` with their own groups apply it to re-assert the invariant, since flat config replaces rule options wholesale and a bare override would otherwise drop the boundary marker.

- `storybookMainConfig` opt-in config for the `.storybook/` config directory (`main.*`, `preview.*`). Relaxes `no-default-export` / `no-anonymous-default-export` (config files must default-export) and `no-extraneous-dependencies` (they import `@storybook/*` devDependencies), and enables `storybook/no-uninstalled-addons` (which reads `.storybook/main.*`). Kept separate from `storybookConfig` because the story-scoped rules in that preset (e.g. `storybook/story-exports`) would false-positive on config files. Add alongside `storybookConfig`.

### Fixed

- `perfectionist` presets no longer conflict with `@37bytes/require-server-only`. The base and React `perfectionist/sort-imports` configs now place `server-only` / `client-only` side-effect imports in a leading `server-boundary` group, matching `require-server-only`'s "first statement in `**/*server.ts`" requirement. Previously perfectionist sorted the side-effect import into the `side-effect` group (position 5) while `require-server-only` pinned it first, so composing `perfectionistBaseConfig` with `createFSDConfig` produced two autofixes pulling the same import in opposite directions.

- Removed the phantom `testing-library/no-wait-for-empty-callback` rule from `testingReact` / `testingReactConfig`. The rule was dropped in `eslint-plugin-testing-library@7` (no rename, no replacement); referencing it at `error` crashed consumer lint with "Could not find rule". No coverage change, the rule could not run.

- Completed the Next.js App Router special-file list in the `nextjs` preset's `no-default-export` / `no-anonymous-default-export` relaxation. Added `global-error.tsx` and the metadata files (`sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image`, `twitter-image`, `icon`, `apple-icon`), all of which require a default export. Dropped `route.ts` from the list: route handlers use named `GET`/`POST`/... exports, so a default export there is a mistake `no-default-export` should catch. Previously consumers had to blanket-disable the rule for `app/**` to accommodate the missing conventions, which stopped catching stray default exports in ordinary `app/` modules.

### Changed

- Migrated package-internal JavaScript imports and exports to native `package.json#imports` aliases and package self-references, removing relative `.js` and `/index.js` specifiers from executable source. Added package-local ESLint guards for static and dynamic relative imports; public package exports remain unchanged.

- Dependency refresh sweep:
    - `eslint` 10.0.1 → 10.7.0 (dev), peer floor raised to `^10.4.0` for `eslint-plugin-unicorn@72`.
    - `@typescript-eslint/eslint-plugin`, `parser`, `utils` 8.59.0 → 8.64.0. TypeScript remains pinned to 6.0.3 within the supported `<6.1.0` range.
    - `@eslint-react/eslint-plugin` 4.2.3 → 5.16.1 and `eslint-plugin-n` 17.x → 18.2.2.
    - Updated `@next/eslint-plugin-next` to 16.2.10, `@vitest/eslint-plugin` to 1.6.23, `eslint-plugin-import-x` to 4.17.1, `eslint-plugin-perfectionist` to 5.10.0, `eslint-plugin-prefer-arrow-functions` to 3.10.1, `eslint-plugin-regexp` to 3.1.1, `eslint-plugin-security` to 4.0.1, `eslint-plugin-sonarjs` to 4.2.0, `eslint-plugin-storybook` to 10.5.2, `eslint-plugin-unicorn` to 72.0.0, `globals` to 17.7.0, and `prettier` to 3.9.5.
    - Replaced the vendored Promise rules with upstream `eslint-plugin-promise@7.3.0`; the five configured `promise/*` rule IDs remain unchanged.
    - `@biomejs/biome` 2.4.13 → 2.5.4 (peer + dev). Migrated promoted nursery rules to their stable categories, including `style/noMultilineString`, and regenerated the config and parity domains.
    - `oxlint` and `eslint-plugin-oxlint` 1.61.0 → 1.73.0, `oxlint-tsgolint` 0.22.0 → 0.25.0. Added explicit parity mappings for Unicorn 72 rule renames and promoted `node/no-mixed-requires`, `unicorn/prefer-export-from`, and `unicorn/prefer-single-call` from the expanded bridge. Oxlint 1.74 is deferred until the matching plugin release.
    - `stylelint` 17.9.0 → 17.14.0 (peer + dev).
    - `@types/react` 19.2.8 → 19.2.17 (dev).

- **BREAKING:** Restructured Node.js presets along role-based axis. Three new exports replace the previous two strict-axis presets and the file-glob override:
    - `nodejsRuntime` (array): strict baseline для production runtime кода — HTTP handlers, services, бизнес-логика, библиотечный код. Замена прежнего `nodejs`.
    - `nodejsConfig` (object override): релакс-правила для bootstrap-фазы — env-loader, server entry-points, build scripts, migrations, seeds. Применяется через flat-config `files`-glob в consumer'ском конфиге. Замена прежнего `nodeEnvOverride`.
    - `nodejsTool` (array): полный preset для CLI-утилит и one-shot скриптов где **весь код** bootstrap-like. Идентичен `[...nodejsRuntime, nodejsConfig]`. Замена прежнего `tool`.

    Removed without alias: `nodejs`, `tool`, `nodeEnvOverride`. Consumers must update imports and compose. Migration recipes:

    ```diff
    // Backend with env-loader + server entry:
    - import { nodejs, nodeEnvOverride } from '@37bytes/code-style/eslint';
    + import { nodejsRuntime, nodejsConfig } from '@37bytes/code-style/eslint';
      export default [
    -     ...nodejs,
    -     nodeEnvOverride
    +     ...nodejsRuntime,
    +     {
    +         files: ['src/env.ts', 'src/server.ts', 'src/main.ts'],
    +         ...nodejsConfig
    +     }
      ];

    // CLI utility:
    - import { tool } from '@37bytes/code-style/eslint';
    - export default [...tool];
    + import { nodejsTool } from '@37bytes/code-style/eslint';
    + export default [...nodejsTool];

    // Pure Node library:
    - import { nodejs } from '@37bytes/code-style/eslint';
    - export default [...nodejs];
    + import { nodejsRuntime } from '@37bytes/code-style/eslint';
    + export default [...nodejsRuntime];
    ```

    Rationale: previous `nodeEnvOverride` had a hardcoded glob (`**/env.{js,ts,...}`) which was too narrow for some projects and too wide for others. Role-based slicing lets each consumer decide what counts as bootstrap-phase by file path, without the preset guessing the project layout.

- **BREAKING:** Added `nextjsServerConfig` — pre-configured override for Next.js server-side files (App Router `page.tsx`/`layout.tsx`/`route.ts`/etc., Pages Router `pages/api/**`, `middleware.ts`, `instrumentation.ts`, `next.config.*`, `**/*.server.{ts,tsx}`). Composes `nodejsConfig` rules with the typical Next.js server-side glob. The `nextjs` preset itself no longer pre-applies this override — consumers explicitly opt in:

    ```diff
    - import { nextjs } from '@37bytes/code-style/eslint';
    - export default [...nextjs];
    + import { nextjs, nextjsServerConfig } from '@37bytes/code-style/eslint';
    + export default [...nextjs, nextjsServerConfig];
    ```

    Caveat: `app/**/page.tsx` files marked with `'use client'` will receive the relaxed rules even though they run on the client. Consumers needing precision-by-directive should fork the glob.

- **BREAKING:** `n/prefer-global/*` family flipped from `'never'` (force `import process from 'node:process'`) to `'always'` (use globals). Affects `process`, `buffer`, `text-decoder`, `text-encoder`, `url`, `url-search-params`, `timers`, `crypto`. `console` was already `'always'`. Rationale: globals are consistent with browser-side code (`console`, `URL` work identically in Node and browsers), modern Node makes everything available globally, importing built-ins for runtime objects is verbose with no DX benefit. Migration: remove `import process from 'node:process'` (and friends) and use globals directly. Existing `import` statements will now lint as errors.
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

## [0.0.3-dev.0] - 2026-04-27

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
