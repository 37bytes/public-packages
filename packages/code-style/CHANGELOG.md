# Changelog

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.0.5] - 2026-08-19

### Fixed

- `settings['import-x/parsers']` указывает на `@typescript-eslint/parser` абсолютным путём из зависимостей пресета. По имени пакета в раскладках с несколькими версиями парсера (pnpm, монорепозитории) import-x мог взять устаревшую копию: она не парсит современный синтаксис, ExportMap остаётся пустым, и правила из 0.0.4 снова молча ничего не находят.

## [0.0.4] - 2026-08-19

### Fixed

- `import-x/no-cycle`, `import-x/named`, `import-x/no-deprecated` заработали на TypeScript: добавлен `settings['import-x/parsers']` для `.ts`, `.tsx`, `.mts`, `.cts`. Раньше граф импортов на TS не строился, и правила молча ничего не находили.
- Устранена ошибка `Resolve error: typescript with invalid interface loaded as resolver`: резолвер задаётся готовым объектом `createTypeScriptImportResolver`, а не поиском пакета по имени.

### Changed

- **BREAKING:** резолвер задаётся через `settings['import-x/resolver-next']`. Переопределения через легаси `settings['import-x/resolver']` перестают действовать молча. Переопределять тем же ключом: `settings['import-x/resolver-next'] = [createTypeScriptImportResolver({ project: '...' })]`.
- Линт стал примерно вдвое медленнее (внутренний замер): ExportMap теперь парсит каждый импортируемый `.ts`. Точка настройки, если мешает: `maxDepth` у `import-x/no-cycle`, ценой глубоких циклов.

## [0.0.3] - 2026-08-17

### Added

- Dependency Cruiser пресеты: `createBaseCruiserConfig` (циклы, орфаны, unresolvable, dev-deps-in-prod) и `createFsdCruiserConfig` (FSD 2.1: матрица слоёв, изоляция слайсов, public API, `@x` cross-imports, server/client маркеры). `dependency-cruiser` становится опциональной peer-зависимостью.
- Role-based Node.js пресеты `nodejsRuntime`, `nodejsConfig`, `nodejsTool`.
- `nextjsServerConfig`, `storybookMainConfig`, `withServerBoundaryFirst`.
- Локальные JSX-правила `@37bytes/jsx-boolean-value` и `@37bytes/jsx-fragments`, `@stylistic/jsx-curly-brace-presence`.

### Changed

- **BREAKING:** ESLint 10.x; React-правила переведены на `@eslint-react/eslint-plugin`, ID правил `react/*` изменились.
- **BREAKING:** `nodejs`, `tool`, `nodeEnvOverride`, `fsdConfig`, `restrictedImportsConfig` заменены на role-based и `create*` API без алиасов.
- **BREAKING:** `nextjs` больше не включает server-side релаксации автоматически, нужен явный `nextjsServerConfig`.
- **BREAKING:** `n/prefer-global/*` переключены на globals: импорты `process`, `Buffer`, `URL`, timers и прочих встроенных runtime objects нужно удалить.
- **BREAKING:** удалён `eslint-plugin-jest-dom` (upstream не поддерживает ESLint 10), часть правил `react/*` удалена без замены.
- TypeScript закреплён на 6.0.3; обновлены Biome, Oxlint, Stylelint, Prettier и ESLint-плагины.
- Внутренние импорты пакета переведены на `package.json#imports` и self-references.

### Fixed

- `createFSDConfig({ dependencyCruiser: true })` сохраняет `import-x/no-internal-modules`, отключает только полные граф-дубли.
- Test harness переносим на Windows: без `URL.pathname` и POSIX `.bin` shims.
- Ошибки resolution и spawn сохраняют исходные `code`, `path` и сообщение вместо JSON parse error.
- Programmatic ESLint harness отключает single-run inference: `CI=true` больше не включает cache mode, терявший type-aware и FSD диагностику.
- README: версии установки и список кастомных правил синхронизированы с package metadata.

## [0.0.3-dev.3] - 2026-07-24

- `createFSDConfig({ dependencyCruiser: true })` перестал отключать `import-x/no-internal-modules`.

## [0.0.3-dev.2] - 2026-07-21

- Опция `createFSDConfig({ dependencyCruiser: true })`: снимает правила границ, которые уже проверяет dependency-cruiser.

## [0.0.3-dev.1] - 2026-07-21

- Dependency Cruiser пресеты, `withServerBoundaryFirst`, `storybookMainConfig`; **BREAKING:** role-based Node.js пресеты, переименование фабрик в `create*`, `n/prefer-global/*` на globals.

## [0.0.3-dev.0] - 2026-04-27

- ESLint 10; **BREAKING:** React на `@eslint-react/eslint-plugin`, удалён `eslint-plugin-jest-dom`.

## [0.0.2] - 2026-04-05

### Added

- Пресет `tool` для CLI-утилит и вариант `perfectionist.tool`.

### Changed

- **BREAKING:** TypeScript 5.9.3 → 6.0.2.
- **BREAKING:** из базового TypeScript-пресета убран `noUncheckedIndexedAccess`.
- Обновлены unicorn 63 → 64, oxlint 1.50 → 1.58, biome 2.4.4 → 2.4.10, `@typescript-eslint` 8.56 → 8.58, perfectionist 5.6 → 5.8, regexp 3.0 → 3.1, ESLint 9.39.2 → 9.39.4 и остальные плагины.

### Removed

- Правило `unicorn/prefer-json-parse-buffer`.

### Fixed

- `setupGitHooks.mjs`: именованный импорт `process` заменён на default.

## [0.0.1] - 2026-03-05

- Первый релиз: ESLint flat configs (`spa`, `nextjs`, `nodejs`), четыре плагина `@37bytes`, конфиги OxLint и Biome, Stylelint для CSS/SCSS-модулей, Prettier, TypeScript-пресеты, EditorConfig.
