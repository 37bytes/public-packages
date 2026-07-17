# Depcruise fixture hygiene

Дата: 2026-07-17 Статус: одобрено

## Проблема

`packages/code-style/__tests__/fixtures/**` глобально исключён из package ESLint и TypeScript. Для dependency-cruiser это позволило накопить шум, не связанный с проверяемыми графовыми нарушениями:

- FSD fixture содержит несуществующие экспорты и модули;
- graph imports не используются и нарушают базовый lint hygiene;
- короткие алиасы нарушают naming policy;
- deprecated TypeScript option блокирует самостоятельную проверку fixture;
- отсутствие общего inventory check позволяет новым fixture-файлам выпадать из проверок.

Graph fixtures могут намеренно описывать запрещённые зависимости, но не должны содержать случайные синтаксические, типовые или naming-дефекты. Намеренная краснота должна быть узкой и проверяться как явный контракт.

## Scope

Первый rollout охватывает только:

- `packages/code-style/__tests__/fixtures/fsd-cruise-project`;
- `packages/code-style/__tests__/fixtures/cruise-base-project`.

Остальные fixture-категории остаются отдельным change. Новый preset проектируется переиспользуемым, чтобы последующий rollout не создавал второй baseline.

## Архитектура

Добавляются два внутренних тестовых модуля:

```text
packages/code-style/__tests__/
  fixture-hygiene.js
  dependency-cruiser-fixtures-hygiene.test.js
```

### `fixture-hygiene.js`

Внутренний reusable preset и вспомогательные функции. Модуль не экспортируется из package exports и не становится публичным API.

Ответственность:

1. Создать ESLint flat config для fixture hygiene.
2. Обнаружить fixture source-файлы напрямую из файловой системы и сравнить этот список с результатами ESLint и TypeScript program.
3. Собрать TypeScript diagnostics через Compiler API.
4. Нормализовать diagnostics до стабильного тестового формата.

### `dependency-cruiser-fixtures-hygiene.test.js`

Параметризует общий preset двумя depcruise-проектами и утверждает их конкретные контракты. Graph behavior остаётся в существующих `dependency-cruiser-base.test.js` и `dependency-cruiser-fsd.test.js`.

Обычный `packages/code-style/eslint.config.js` не меняется. Глобальный ignore fixtures остаётся, потому что production dogfood и fixture hygiene являются разными контрактами.

## ESLint contract

Baseline включает:

1. `@eslint/js` recommended correctness rules.
2. `@typescript-eslint/eslint-plugin` flat preset `flat/recommended-type-checked` с type information.
3. Текущую naming policy пакета из существующих source-of-truth rule objects:
    - `id-length` из `eslint/rules/javascript.js`;
    - `@typescript-eslint/naming-convention` из `eslint/rules/typescript.js`;
    - `@37bytes/boolean-naming`;
    - `@37bytes/enum-pattern`.
4. Проверку неиспользуемых imports и variables. Чистые graph edges выражаются side-effect imports без фиктивных bindings.

Baseline не включает:

- FSD restrictions;
- import boundaries и dependency policy;
- import ordering;
- perfectionist;
- sonarjs;
- React policy;
- formatting.

Hygiene test запускается без autofix. Любая ESLint diagnostic, warning или error, считается нарушением контракта.

Inline disable comments в fixture-файлах не допускаются как способ сделать suite зелёным. Реальное исключение добавляется в reusable preset для минимального file glob и сопровождается объяснением.

## TypeScript contract

TypeScript проверяется через Compiler API, а не через парсинг человекочитаемого вывода `tsc`.

Нормализованная diagnostic содержит:

- numeric code;
- relative file path;
- line;
- column;
- flattened message.

### FSD fixture

`fsd-cruise-project` обязан выдавать ноль syntactic, options и semantic diagnostics.

Для этого:

- каждый graph edge выражается side-effect import существующего модуля;
- `server-only` и `client-only` получают локальные ambient declarations в `src/markers.d.ts`;
- fixture не содержит фиктивных named/default exports и значений, созданных только ради линтера;
- deprecated `baseUrl` удаляется; существующий relative target `"@/*": ["./src/*"]` продолжает резолвиться относительно директории `tsconfig.json`, без `ignoreDeprecations`.

### Base fixture

`cruise-base-project` обязан выдавать ровно одну ожидаемую diagnostic:

- code `TS2307`;
- file `src/unresolvable.ts`;
- line 1;
- message относится к module specifier `./missing`.

Эта ошибка является частью сценария `not-to-unresolvable`. Исчезновение ошибки, изменение её расположения или появление любой дополнительной diagnostic валит тест.

## Очистка graph fixtures

Очистка не должна менять набор graph edges.

Обязательные изменения:

1. Преобразовать named/default graph imports в side-effect imports, сохранив module specifiers и комментарии ожидаемых правил.
2. Удалить шумовые aliases `UT2`, `UT3`, `u2`, `st2`, `H2` и аналогичные сокращения вместе с ненужными bindings.
3. Не добавлять фиктивные exports, dependency arrays или другие значения только для удовлетворения линтера.
4. Добавить ambient module declarations для marker packages.
5. Исправить naming policy и базовые correctness violations.
6. Обновить deprecated TypeScript config.

После очистки FSD depcruise fixture обязана по-прежнему выдавать те же 16 violations. Base fixture обязана по-прежнему выдавать цикл, orphan и unresolved edge. Отдельно исправляется текущее stale expectation после переименования `a.ts/b.ts` в `first.ts/second.ts`.

## Тестовые контракты

Новый test file содержит четыре независимых проверки.

### ESLint, FSD fixture

- обнаружить полный список `src/**/*.{js,jsx,ts,tsx}` напрямую из файловой системы;
- lint того же списка файлов;
- ноль diagnostics;
- множество ESLint result paths точно равно обнаруженному множеству source-файлов.

### ESLint, base fixture

- тот же baseline;
- ноль diagnostics;
- намеренный unresolved import не превращается в ESLint exemption.

### TypeScript, FSD fixture

- ноль syntactic diagnostics;
- ноль options diagnostics;
- ноль semantic diagnostics;
- множество fixture-local project source paths, после исключения TypeScript lib files и внешних declarations, точно равно списку файлов, включённых fixture `tsconfig.json`.

### TypeScript, base fixture

- нормализованный массив diagnostics точно равен одному ожидаемому `TS2307`;
- TypeScript program содержит все fixture source-файлы, включая `unresolvable.ts`.

## Защита от ложнозелёного результата

1. Пустой список обнаруженных source-файлов не считается успехом.
2. Игнорирование хотя бы одного обнаруженного файла не считается успехом.
3. Множества обнаруженных файлов, ESLint results и TypeScript program files сравниваются явно.
4. Новый source-файл автоматически попадает под ESLint и TypeScript checks.
5. Naming policy импортируется из текущих rule objects, а не копируется.
6. Hygiene не заменяет depcruise graph assertions.
7. Тест не меняет fixture, assertion или config автоматически при обнаружении ошибки.

## Подключение к suite

Новый файл размещается непосредственно в `__tests__` с suffix `.test.js`. Текущий script `node --test __tests__/*.test.js ...` и discovery guard подхватят его без изменения `package.json`.

## Acceptance criteria

1. Новый hygiene test проходит.
2. `fsd-cruise-project` имеет ноль ESLint diagnostics.
3. `fsd-cruise-project` имеет ноль TypeScript diagnostics.
4. `cruise-base-project` имеет ноль ESLint diagnostics.
5. `cruise-base-project` имеет ровно один ожидаемый TypeScript diagnostic `TS2307`.
6. Существующий FSD depcruise test сохраняет матрицу из 16 violations.
7. Base depcruise test проходит с актуальными именами cycle-файлов.
8. Focused fixture-backed ESLint и FSD tests остаются зелёными.
9. Не добавлены public exports, inline lint disables или подавление TypeScript deprecations.

## Не входит в scope

- rollout hygiene на naming, parity, general ESLint и stylelint fixtures;
- изменение публичного API `@37bytes/code-style`;
- изменение FSD или dependency-cruiser policy;
- расширение behavioral coverage отсутствующих depcruise rules;
- исправление hybrid parity comparison по line-level diagnostics.
