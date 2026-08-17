# FIXME roadmap: `@37bytes/code-style`

Состояние ветки при составлении: `feat/code-style-eslint-10` @ `6d69cda`.

## P0. Windows-портируемость тестового харнесса

- [x] Исправить вычисление каталога теста `boolean-naming`: использовать переносимый `import.meta.dirname` вместо `URL.pathname`.
- [x] Добавить единый test-only launcher для npm-бинарей: резолвить `package.json#bin` и запускать JS launcher через `process.execPath`.
- [x] Перевести на launcher вызовы Oxlint, Biome и dependency-cruiser в тестах и генераторе parity domains.
- [x] Не маскировать ошибки запуска бинаря под ошибки JSON: при отсутствии `stdout` пробрасывать исходную spawn-ошибку.

Критерии закрытия:

- `boolean-naming` проходит с корректными файловыми путями на POSIX и Windows.
- Харнесс не зависит от POSIX shim в `node_modules/.bin`.
- Ошибка отсутствующего или незапускаемого бинаря сохраняет исходный `code`, `path` и сообщение.
- `pnpm test:plugins`, dependency-cruiser tests, hybrid idempotency и parity tests проходят.

## P0. Нестабильность полного набора тестов

Исходное наблюдение на Node v24.12.0: focused suites были зелёными, но full-suite периодически терял type-aware/FSD diagnostics и падал в TypeScript `normalizeSlashes`. Точный reproducer найден: `CI=true node --test __tests__/dependency-cruiser-fixtures-hygiene.test.js __tests__/fsd-e2e.test.js` стабильно давал 10 падений из 57, а тот же запуск без `CI` проходил 57/57.

- [x] Изолировать trigger: `CI=true` включает automatic single-run inference в `@typescript-eslint/typescript-estree`; `TERM` и `NO_COLOR` на результат не влияют.
- [x] Проверить причину: programmatic ESLint harness многократно использует один `filePath` с разным `lintText` и создаёт несколько программ, поэтому single-run cache нарушает модель harness.
- [x] Запретить automatic single-run inference в обоих programmatic parser configs. Concurrency, порядок, retries и ассерты не изменены.
- [x] Проверить исправление под `CI=true` и обычным окружением, затем полный pre-commit boundary.

Критерии закрытия:

- `pnpm test` проходит без отменённых или пропущенных тестов.
- Programmatic ESLint harness даёт одинаковые type-aware/FSD diagnostics с `CI=true` и без него.
- Исправление задаёт корректную parser lifecycle model, не меняя concurrency, порядок и семантику тестов.

## P0. Документация установки

- [x] Синхронизировать README с `peerDependencies`: ESLint `^10.4.0`, Prettier `3.9.5`, TypeScript `6.0.3`, Stylelint `17.14.0`, Oxlint `1.73.0`, Biome `2.5.4`.
- [x] Обновить версию пакета в шапке README до `0.0.3`.
- [x] Дополнить таблицу custom rules всеми одиннадцатью экспортируемыми правилами.

Критерий закрытия: команды установки из README не создают peer-конфликтов с `package.json`.

## P1. Agent guide

- [x] Обновить число parity-тестов с 892 до 898.
- [x] Убрать ссылку на пустой `[Unreleased]`, сохранив ссылку на design docs.

## Не входит в исправление

- Откат ESLint 10, TypeScript 6.0.3 или typescript-eslint 8.64.0 без отдельного доказанного дефекта.
- Добавление custom ESLint plugins в cross-tool parity: их поведение проверяют unit и integration suites, а эквивалентов в Biome/Oxlint может не быть.
- Смена package homepage с default branch `master` на feature branch.
- Перезапись исторических `docs/superpowers/research` логов с машинными путями.
- Искусственное заполнение пустой секции changelog `[Unreleased]`.
- Новый каталог `examples/` без отдельного consumer-сценария.

## Финальная проверка

- [x] `pnpm test:plugins`: 125/125
- [x] focused dependency-cruiser, hybrid idempotency и parity tests
- [x] `pnpm test:parity`: 898/898
- [x] `pnpm test`: 1189/1189, затем 10 последовательных прогонов 1189/1189
- [x] `pnpm lint`
