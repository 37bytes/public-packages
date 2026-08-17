# Лёгкий eslint-пресет FSD для случая подключённого dependency-cruiser

**Дата**: 2026-07-21, ревизия 2026-07-24 (вариант X по итогам живой миграции консюмера). **Ветка**: `feat/code-style-eslint-10`. **Статус**: реализовано; исходный дизайн опубликован в `0.0.3-dev.2`, ревизия X (исправление регрессии) в `[Unreleased]` → `0.0.3-dev.3`.

## Ревизия 2026-07-24: `no-internal-modules` остаётся (вариант X)

Исходный дизайн ниже содержал ошибку классификации, вскрытую на живой миграции консюмера (`frontend-next`). Строка таблицы `import-x/no-internal-modules` → "полный дубль, убрать" **неверна**.

Факт (проверен эмпирически на fixture-харнессе + чтением исходника `eslint-plugin-import-x@4.17.1`): `no-internal-modules` делает ДВЕ работы:
1. (a) public API FSD-слайсов (`@/entities/user/model/types` вглубь). Это dep-cruiser зеркалит через `no-deep-into-*`.
2. (b) запрет deep-import в РЕЗОЛВЯЩИЕСЯ внешние пакеты (`prettier/doc`, `eslint/use-at-your-own-risk`). Нерезолвящиеся правило пропускает (строка 92 rule.js: `if (!resolved) return false`), поэтому первый прогон с `lodash` (не установлен) дал ложный "clean".

dep-cruiser не покрывает (b): все FSD-правила `to: ^src/`, а base.js (circular/orphans/deprecated/unresolvable/dev-deps/...) запрета на deep-import в потроха резолвящегося пакета не содержит. Значит `no-internal-modules` не полный дубль, а **половинный**, и снос его флагом (как в `0.0.3-dev.2`) молча убирает (b) на всех файлах консюмера с флагом. Дополнительно: top-level `app/` (Next route tree выше FSD-корня `src/`) покрывался только `no-internal-modules`, dep-cruiser его `^src/`-правилами не достаёт, так что снос ронял и его public API.

**Вариант X (принят пользователем):** флаг убирает ТОЛЬКО два правила, которые dep-cruiser заменяет полностью: `import-x/no-restricted-paths` (направление слоёв) и `@37bytes/no-slice-self-import`. `no-internal-modules` (+ blocks barrel/api) остаётся включённым всегда. Это чинит и (b), и app/-гэп одним ходом, без `routeRoot`/scoping. Цена: FSD-нарушения public API под двойным контролем (eslint в редакторе + dep-cruiser в CI) — редундантный сигнал на реальном нарушении, не шум на чистом коде.

Отвергнут полный дедуп (per-location allow-листы + escape-hatch `@/**` для src, строгий allow для app/): убирает и оверлап (a), но ценой per-location сложности, остатка на relative-импортах и риска протечки (`**/src/**` матчит `node_modules/*/src/`). KISS: не стоит удаления дубля, который стреляет только по нарушениям.

Формулировка исходного принципа уточнена: "флаг сносит то, что dep-cruiser заменяет **полностью**" (а не "граф-выразимое"). Всё ниже этой секции — исходный дизайн как исторический контекст; где он говорит "убрать no-internal-modules", читать через эту ревизию.

## Цель

`createFSDConfig` (eslint) и `createFsdCruiserConfig` (dependency-cruiser) во многом проверяют одно и то же: иерархию слоёв, public API, изоляцию слайсов. Проект, подключивший оба, получает двойной enforcement одних и тех же границ: два инструмента репортят одно нарушение с разными сообщениями.

Драйвер (выбран пользователем): **дедупликация, single source of truth**. Если в проект затащили dependency-cruiser, дублировать те же правила в eslint незачем. В линтере кода остаётся ровно то, что dependency-cruiser по FSD сделать не может.

Не-цель: производительность. Резолюционные правила убираются как следствие дедупликации, а не ради скорости. Не-цель: менять поведение по умолчанию. Дефолт остаётся полным (heavy) пресетом, лёгкий вариант строго opt-in.

## Разбор пересечения

Каждое eslint-правило FSD классифицировано по признаку "есть ли граф-аналог в dependency-cruiser":

| eslint-правило | аналог в dependency-cruiser | вердикт |
| --- | --- | --- |
| `import-x/no-restricted-paths` (слои + cross-import) | `layers-*-up`, `no-cross-slice` | полный дубль, убрать |
| `import-x/no-internal-modules` (public API, deep-import) | `no-deep-into-*` | полный дубль, убрать |
| `@37bytes/no-slice-self-import` | одноимённое правило (покрывает и `export ... from`) | полный дубль, убрать |
| `import-x/order` | нет (граф не знает порядка внутри файла) | уникально, оставить |
| `@37bytes/no-legacy-folders` | нет (имена папок, не рёбра графа) | уникально, оставить |
| `@37bytes/require-server-only` / `require-client-only` | `require-*-only` (только наличие импорта) | комплементарно, оставить (см. Решение 3) |
| (нет аналога в eslint) | `no-cross-segment` | уникально для dependency-cruiser |

Три убираемых boundary-правила это ровно те, которым нужен `eslint-import-resolver-typescript`, то есть работа, которую dependency-cruiser делает нативно по всему графу за один проход.

## Решения

1. **Форма API: булев флаг на существующей функции.** `createFSDConfig({ dependencyCruiser: true })`. Отвергнуто: отдельный экспорт `createFSDLintConfig()` (два имени поддерживать, "lint/light" в имени размыто, надо объяснять кто когда). Причина выбора: решение пользователя это ровно один булев факт ("я тоже гоняю dependency-cruiser"); флаг на той же функции это минимальная и самая обнаружимая поверхность.

2. **Флаг называет ПРИЧИНУ, не эффект.** `dependencyCruiser`, не `light`/`minimal`. Если в будущем ещё одно правило переедет в граф, поведение флага обновится, а конфиг пользователя останется прежним. Имя переживает перетасовку правил между движками.

3. **server-only / client-only остаются в eslint, dependency-cruiser не трогаем.** dependency-cruiser проверяет только наличие импорта `server-only` где-либо в модуле. eslint-правило проверяет, что он первой строкой, и автофиксит. Первая строка load-bearing: `import 'server-only'` должен выполниться до любого другого кода модуля, иначе side-effect импорт выше него успеет отработать на клиенте раньше падения сборки. Позицию dependency-cruiser выразить не может в принципе, поэтому правило не дубль. Формальное пересечение только в кейсе "импорта нет совсем" (тогда ругнутся оба движка), но eslint автофиксит его на сохранении, так что двойное сообщение эфемерно. Лезть в отдельный конфиг dependency-cruiser ради редкого само-заживающего кейса не стоит.

4. **Принятый компромисс: single point of failure.** Следствие дедупликации: если проект выставил флаг, но забыл прогнать dependency-cruiser в CI, границы FSD не проверяет никто и молча. Это цена подхода, выбрана осознанно. Смягчение только документацией.

## Результирующий пресет при `dependencyCruiser: true`

Пресет схлопывается с 5 блоков до 3:

- **Блок 1 (все файлы)**: плагины `{ '@37bytes', 'import-x' }`, правила `import-x/order` (по иерархии FSD) + `@37bytes/no-legacy-folders`. Оба плагина всё ещё нужны: `order` тянет `import-x`, `no-legacy-folders` тянет `@37bytes`.
- **Блок server.ts**: `@37bytes/require-server-only`.
- **Блок client.ts**: `@37bytes/require-client-only`.

Убираются: `import-x/no-restricted-paths`, `import-x/no-internal-modules`, `@37bytes/no-slice-self-import`, и два блока-послабления (barrel-файлы, api-сегмент), которые существуют только чтобы гасить `no-internal-modules` (без него это no-op).

Дефолт (`dependencyCruiser: false`) байт-в-байт как сейчас. Изменение неломающее.

## Реализация

Файл `eslint/fsd.js`, функция `createFSDConfig`:

1. Достать флаг: `const { allowPatterns = [], dependencyCruiser = false } = options;`.
2. Правила главного блока собирать условно: `boundary`-правила (`no-restricted-paths`, `no-internal-modules`, `no-slice-self-import`) добавлять через `...(dependencyCruiser ? {} : { ... })`; `import-x/order` и `no-legacy-folders` всегда.
3. Блоки barrel (`**/index.ts, **/server.ts, **/client.ts`) и api-сегмент пушить в массив только когда `!dependencyCruiser`.
4. Блоки server.ts / client.ts (`require-*-only`) пушить всегда.
5. Обновить JSDoc `@param options.dependencyCruiser` с явным предупреждением: передавать флаг, только если реально гоняешь `createFsdCruiserConfig` в CI.

## Тесты

Новая describe-группа в `__tests__/fsd-e2e.test.js`, на том же fixture-проекте через существующий хелпер `lint(code, relativePath, fsdOptions)`:

1. С `{ dependencyCruiser: true }` заведомо нарушающие импорты НЕ дают ошибок трёх убранных правил (`assertNoError` для `import-x/no-restricted-paths`, `import-x/no-internal-modules`, `@37bytes/no-slice-self-import`) на тех же кейсах, где дефолт их ловит.
2. С `{ dependencyCruiser: true }` выжившие правила продолжают ругаться (`assertHasError` для `import-x/order` на неправильном порядке, `@37bytes/require-server-only` на server.ts без импорта; `no-legacy-folders`, если в fixture есть legacy-папка, иначе отдельный кейс).
3. Регрессия дефолта: без флага boundary-правила по-прежнему ловятся (защита от случайной инверсии условия).

## Доки

1. JSDoc-`@example` в `eslint/fsd.js`: показать `createFSDConfig({ dependencyCruiser: true })`.
2. Строка в `CHANGELOG.md` секция `[Unreleased]`.
3. Короткая заметка про опцию в `README.md` рядом с таблицей `createFSDConfig()`.

## Критерии приёмки

1. `createFSDConfig({ dependencyCruiser: true })` возвращает пресет без трёх boundary-правил и без двух блоков-послаблений; `import-x/order`, `no-legacy-folders`, `require-server-only`, `require-client-only` на месте.
2. `createFSDConfig()` без опции возвращает текущий пресет без изменений.
3. Новые e2e-тесты зелёные; существующие 892 parity + FSD e2e не тронуты.
4. `pnpm test` зелёный целиком.
5. dependency-cruiser вне scope: `dependency-cruiser/*` и parity-домен не меняются.
