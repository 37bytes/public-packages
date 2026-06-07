# Cross-linter parity tests для `@37bytes/code-style`

**Дата**: 2026-06-06, ревизия v2 от 2026-06-07 (по итогам совета моделей: 4 внешних члена + solo-opus, вердикт implement-with-changes). **Ветка**: `feat/code-style-eslint-10`. **Статус**: реализовано и зелёно с 2026-06-07; 884 теста, 0 падений. Базовый снапшот: `docs/superpowers/research/2026-06-07-green-baseline.txt`.

## Цель

Пакет обещает: eslint (source of truth), biome и oxlint конфиги согласованы. Сейчас это обещание держится на дисциплине синхронизации трёх рукописных деревьев (`eslint/rules/`, `biome/rules/`, `oxlint/rules/`) и на `hybrid-idempotency.test.js`, который покрывает только гибридный сценарий на тонком fixture-сете. Добавляем тесты, которые ловят дрейф для двух консьюмеров:

1. Гибридного (biome/oxlint + eslint с бридж-конфигами).
2. Standalone (взял из пакета только biome-конфиг или только oxlint).

## Решения

1. **Mapping эквивалентности правил**: явный модуль соответствий, обязательный (отсутствие записи = красный тест, не silent skip). Seed из уже существующих `biome/eslint-overrides.js` (36 записей) и `oxlint/type-aware-overrides.js`. Для oxlint поверх ручной таблицы работает систематическая нормализация префиксов (`@typescript-eslint/`→`typescript/`, `n/`→`node/`, `@next/`→`nextjs/`, `import-x/`→`import/`, `react-hooks/`→`react/`; закрывает ~167 из 206 кандидатов). Для biome нормализации не существует (kebab vs camelCase, naive strip = 0/78): biome-таблица ведётся целиком вручную. Отвергнуто: `stripPluginPrefix` как универсальный fallback (консенсус совета: мёртв для всех трёх неймспейсов), verdict-снапшоты (18 bump'ов превратят их в шум).
2. **Архитектура двухслойная**: статическая исчерпывающая сверка списков + динамические репрезентативные fixtures. Отвергнуто: исчерпывающие per-rule микро-fixtures (дублируют upstream-тесты линтеров).
3. **Гранулярность fixtures: preset-oriented мини-проекты** (инциденты ветки были свойствами композиции пресетов и file-pattern'ов, не отдельных правил).
4. **Известные дыры покрытия**: checked-in allowlist `known-gaps` с причиной у каждой записи. Тест падает только на новом дрейфе.
5. **Наполнение слоя 2**: regression-first, из подтверждённых находок WF1-аудита (50 находок, `docs/superpowers/research/2026-06-06-wf1-deps-and-parity-audit.json`).
6. **Policy обратного дрейфа (tool строже eslint)**: promotion-first triage. Каждая норма обязана жить в eslint; тулам разрешено только зеркалить. Extra либо промоутится в eslint (если выразим имеющимися плагинами и достоин пакета), либо подрезается. `known-extras` не существует as a matter of policy. [Подтверждено пользователем 2026-06-07. Triage пяти найденных extras: noCommonJs -> промоут import-x/no-commonjs; prefer-number-properties -> промоут в eslint unicorn; jsx-handler-names -> подрезать; jsx-no-undef -> подрезать (TS ловит компилятором); noExportsInTest/noDuplicateTestHooks -> проверить эквиваленты в @vitest/eslint-plugin, есть -> промоут, нет -> подрезать.]
7. **Порядок работ** (split совета, решён в пользу большинства): **тесты-first на текущих версиях → починка дрейфа до зелёного → бампы зависимостей под защитой тестов**. Тесты сразу после написания красные и именуют все подтверждённые дрейфы; это фича, не баг. Каждый последующий bump получает parity-diff как выхлоп тестов.

## Слой 1: статическая сверка списков (`__tests__/parity-static.test.js`)

Без fixtures, без прогона линтеров по коду.

### Кандидатное множество (исправлено: было вакуумно)

```js
// ВАЖНО: configs['flat/all'] — МАССИВ config-объектов, не объект с .rules
const offList = oxlintPlugin.configs['flat/all']
    .flatMap((config) => (config.rules ? Object.keys(config.rules) : []));
assert.ok(offList.length > 100, 'off-list extraction is broken (plugin shape changed?)'); // guard против vacuous green

// off-list = всё, что тул МОГ БЫ покрыть (779 правил, все 'off' unconditionally).
// Кандидаты = только пересечение с тем, что наш eslint реально включает, ПО КАЖДОМУ ПРЕСЕТУ:
const eslintEnabled = collectEnabledRules(presetConfigArray); // severity !== off, по spa/nextjs/nodejsRuntime/nodejsTool
const candidates = offList.filter((rule) => eslintEnabled.has(rule));
// ~206 кандидатов oxlint / ~78 biome вместо 779; без пересечения known-gaps = ~573 строки шума
```

### Проверка

Для каждого кандидата: `manualMapping` (или префикс-нормализация для oxlint) обязан дать эквивалент, и эквивалент обязан быть включён в effective-set тула. Нет записи в mapping = красный тест. Нет эквивалента в туле = красный тест, если правило не в `known-gaps`.

- `effectiveOxlintRules`: `Object.keys(config.json rules)` + overrides. Категории НЕ разворачиваем: сгенерированный конфиг имеет `categories: {}`, все правила явные (расширение через `oxlint --rules` добавить, только если categories начнут использоваться).
- `effectiveBiomeRules`: правила из `config.json` + **раскрытие `domains`** (`react: 'all'`, `next: 'all'`, `test: 'all'` включают правила неявно; раскрывать через Biome JSON Schema, тем же путём, что `biome/build.js`). Без раскрытия `noImgElement` и подобные дадут false positive.
- Сверка severity для совпавших правил (error vs warn = дрейф, не parity).
- Поле `partialEquivalence` в mapping для случаев "имя совпало, scope уже" (прецедент: `no-script-url` vs `noScriptUrl`, biome'овский проверяет только JSX href).

### Структурные дыры моста (ручные блоки, бридж их не видит)

1. **`@eslint-react/*`**: off-листы бриджей гасят legacy `react/*` правила; наш eslint использует `@eslint-react/*`. Бридж не знает о нашем React-плагине. React-секция mapping ведётся полностью вручную с комментарием об этом.
2. **jsPlugin-правила** (sonarjs, regexp, storybook, import-x, `@37bytes/*`): 100+ правил вне видимости бриджей. Отдельный sub-describe со своим кандидатным множеством (наши eslint-конфиги этих плагинов против oxlint jsPlugins / biome-эквивалентов).

### Обратная проверка (tool -> eslint)

Каждое правило, включённое в biome/oxlint конфиге, обязано иметь eslint-источник через mapping. Tool-only правило = красный тест (при policy п.6; до подтверждения policy: warning). Контролирует класс "Biome enforces noCommonJs с нулевым eslint-аналогом" и рост `biome/eslint-overrides.js` (36 ручных записей это уже накопленный долг отсутствия этой проверки).

### Bump-shield комментарий

Шапка теста явно декларирует: от бампов чего тест защищает (oxlint, biome, eslint-plugin-oxlint, eslint-config-biome, eslint-plugin-n), к чему слеп (`@eslint-react/*`, `@next/next` — вне off-листов). Плюс assertion на версию `eslint-plugin-oxlint` (мажор бриджа меняет состав off-листа: падение должно объяснять причину).

## Слой 2: динамические preset-fixtures (`__tests__/parity-presets.test.js`)

Мини-проект на каждый shipped-пресет в `__tests__/fixtures/parity/<preset>/`:

- `spa/`
- `nextjs/` (включая `app/page.tsx` с `'use client'` + `console.log` — фиксирует glob trade-off `nextjsServerConfig`; `app/api/route.ts` с `process.env`; `src/env.ts` под name-based convention)
- `nodejs-runtime/`
- `nodejs-tool/`
- `testingConfig` — поддиректория `__tests__/` внутри каждого мини-проекта (path-matching — часть контракта)

Механика (CLI-прогоны, как в `hybrid-idempotency.test.js`, CWD = root):

1. Прогнать чистый eslint, чистый biome, чистый oxlint по мини-проекту.
2. Вердикты привести через mapping к каноническим именам.
3. Сравнить per-file множества сработавших правил modulo `known-gaps`.
4. Tool-only срабатывания на fixtures флагаются (blocking при policy п.6).
5. Diff в ошибке называет файл, правило и направление дрейфа.

## Общие артефакты (`__tests__/parity/`)

- `rule-equivalence.js` — mapping-модуль: oxlint префикс-нормализация + исключения, biome полная таблица, `partialEquivalence` аннотации. Живёт рядом с конфигами как shared-модуль (используется и тестами, и потенциально build-скриптами), не как test-local fixture.
- `known-gaps.js` — задокументированные дыры, каждая с `reason` и датой/версиями проверки.

## Сопутствующее

- **AGENTS.md** в `packages/code-style/` с протоколом синхронизации трёх деревьев. Пишется через skill `claude-md-curator` после починки дрейфа.
- Комментарий в коде, ссылающийся на несуществующий "bridge analysis script", исправить или реализовать скрипт (находка совета: инструмент упомянут, в репо отсутствует).
- Структурная альтернатива "одно дерево-источник, biome/oxlint генерятся" отвергнута: семантика правил между движками расходится достаточно, чтобы генерация выродилась в таблицу исключений размером с сами конфиги.

## Известные ограничения (датированные, post-MVP)

1. **Type-aware parity** (2026-06-07): 8 правил из `oxlint/type-aware-overrides.js` (включая `no-floating-promises`) живут в tsgolint-прогоне; standalone oxlint без `--type-aware` даёт другой effective-set, `config.json` это не кодирует. Отдельная итерация.
2. **Autofix-дивергенция** (2026-06-07): тулы могут чинить один и тот же дефект по-разному (класс `prefer-global-this` из handoff). Ни один слой не сравнивает `--fix` выхлоп.
3. **Glob-дрейф вне fixtures**: слой 2 проверяет только представленные файлы; новый glob без fixture-файла проходит молча. Митигация: каждое изменение glob в пресетах сопровождается fixture-файлом (зафиксировать в AGENTS.md).
4. **Судьба `hybrid-idempotency.test.js`**: решить после слоя 2 (deprecate, если слой 2 superset; иначе оставить с явным разграничением ответственности).
5. **Поведение `eslint-config-biome` при `recommended: false`** неверифицировано (влияет на состав off-листа): проверить при имплементации слоя 1.

## Acceptance criteria

1. Слой 1: off-list извлечён не пусто (guard), кандидаты = пересечение с eslint-enabled per preset; каждый кандидат либо находит включённый эквивалент (с совпавшей severity), либо числится в `known-gaps` с причиной. Mapping обязателен: нет записи = красный.
2. Обратная проверка: tool-only правил нет (либо все в явном статусе по policy п.6).
3. Слой 2: мини-проекты для всех shipped-пресетов; каждая подтверждённая находка WF1 представлена строчкой в соответствующей ситуации.
4. Сразу после написания тесты КРАСНЫЕ и именуют подтверждённый WF1-дрейф (это валидация тестов). Зелёные после фазы починки. Падение любого теста называет правило, файл и направление.
5. 230 существующих тестов не тронуты; новые на `node:test`, в стиле существующих, без новых dev-зависимостей.
6. На время красной фазы parity-тесты живут как отдельный скрипт `test:parity` и НЕ входят в корневой `test` (иначе pre-commit hook, гоняющий полный monorepo-тест, блокирует любые коммиты). Вшить в `test` — последний шаг фазы починки, после зелёного прогона. [Подтверждено 2026-06-07.]

## История

- v1 (2026-06-06): одобрена пользователем после брейншторма.
- v2 (2026-06-07): по итогам совета моделей. Исправлено: вакуумная формула off-листа (массив, не объект), кандидатное множество (пересечение с eslint-enabled), stripPluginPrefix заменён на обязательный mapping-модуль с seed из существующих overrides, добавлены структурные дыры моста (@eslint-react, jsPlugins), обратная проверка, biome domains, bump-shield, severity-сверка, partialEquivalence; порядок работ зафиксирован tests-first; type-aware и autofix вынесены в датированные post-MVP gaps.
