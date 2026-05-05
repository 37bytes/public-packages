# @37bytes/code-style

> **0.0.1-dev**: пакет в активной разработке. API может меняться без предупреждения.

Точка входа для инструментов поддержки качества проектов 37bytes

## Установка

```bash
npm install @37bytes/code-style --save-dev
```

Обязательные peer-зависимости (версии фиксированы):

```bash
npm install eslint@9.39.2 prettier@3.8.1 typescript@5.9.3 --save-dev
```

Опционально:

```bash
npm install stylelint@17.4.0 --save-dev     # CSS/SCSS линтинг
npm install oxlint@1.50.0 --save-dev         # гибридный режим OxLint
npm install @biomejs/biome@2.4.4 --save-dev  # гибридный режим Biome
```

## ESLint

Три конфига по типу приложения: `spa`, `nextjs`, `nodejs`.

```js
// eslint.config.js
import { spa } from '@37bytes/code-style/eslint';

export default [...spa];
```

```js
// Next.js
import { nextjs } from '@37bytes/code-style/eslint';

export default [...nextjs];
```

```js
// Node.js
import { nodejs } from '@37bytes/code-style/eslint';

export default [...nodejs];
```

### Дополнительные слои

Добавляются через spread после основного конфига:

```js
import { spa, testingConfig, testingReactConfig, storybookConfig } from '@37bytes/code-style/eslint';

export default [...spa, ...testingConfig, ...testingReactConfig, ...storybookConfig];
```

| Слой                  | Описание                               |
| --------------------- | -------------------------------------- |
| `testingConfig`       | Vitest + смягченные правила для тестов |
| `testingReactConfig`  | Testing Library + jest-dom             |
| `storybookConfig`     | Правила Storybook                      |
| `reactCompilerConfig` | Правила React Compiler                 |
| `createFSDConfig()`   | Ограничения архитектуры FSD            |

### Perfectionist (опциональная автосортировка)

```js
import { perfectionist } from '@37bytes/code-style/eslint';

export default [
    ...perfectionist.spa
    // или perfectionist.nextjs, perfectionist.nodejs
];
```

### Кастомные плагины @37bytes

| Правило                   | Описание                                             |
| ------------------------- | ---------------------------------------------------- |
| `@37bytes/no-storage`     | Запрет прямого доступа к localStorage/sessionStorage |
| `@37bytes/no-arrow-props` | Запрет стрелочных функций в JSX-пропсах              |
| `@37bytes/boolean-naming` | Обязательные префиксы булеанов (is/has/should/...)   |
| `@37bytes/enum-pattern`   | Запрет enum, `as const` + UPPER_CASE                 |

## OxLint (опционально)

Готовый конфиг для гибридного режима OxLint + ESLint:

```js
import { config } from '@37bytes/code-style/oxlint';
```

Подробнее: [docs/oxlint.md](./docs/oxlint.md).

## Biome (опционально)

Готовый конфиг для гибридного режима Biome + ESLint:

```js
import { config } from '@37bytes/code-style/biome';
```

## Stylelint (опционально)

Конфиг для CSS/SCSS модулей: порядок свойств, lowerCamelCase селекторы, запрет type-селекторов, обязательные CSS-переменные для цветов/z-index/шрифтов.

```bash
npm install stylelint@17.4.0 --save-dev
```

```js
// .stylelintrc.js
import { config } from '@37bytes/code-style/stylelint';

export default config;
```

Основано на `stylelint-config-standard-scss`. Включает плагины `stylelint-order` и `stylelint-declaration-strict-value`.

## Prettier

```js
// prettier.config.js
import { config } from '@37bytes/code-style/prettier';

export default config;
```

4 пробела, одинарные кавычки, без trailing commas, точки с запятой, 120 символов.

## TypeScript

```json
{
    "extends": "@37bytes/code-style/typescript/react"
}
```

| Конфиг             | Описание                          |
| ------------------ | --------------------------------- |
| `typescript/base`  | Строгий базовый конфиг (ES2023)   |
| `typescript/react` | React-приложение (DOM types, JSX) |
| `typescript/node`  | Node.js (NodeNext modules)        |

### TypeScript 7 (Native Preview)

TypeScript 7.0 это Go-портированный компилятор Microsoft (анонс 2026-04-21), распространяется как `@typescript/native-preview` с бинарём `tsgo`. Семантика проверки типов идентична TS 6.0, скорость в среднем ~10× выше. Стабильный programmatic API ожидается в 7.1.

С нашим preset работает **частично**: tsgo годится для CLI-typecheck, но stable JS Compiler API ещё не выпущен, поэтому `@typescript-eslint` (peer cap `<6.1.0`) и type-aware ESLint правила TS 7 не поддерживают. Microsoft рекомендует side-by-side использование с TS 6.

#### Что работает с tsgo прямо сейчас

| Компонент                                     | Статус | Как                                                            |
| --------------------------------------------- | ------ | -------------------------------------------------------------- |
| `tsgo --noEmit` для быстрого pre-flight       | ок     | Локальный typecheck в dev-цикле, см. caveat ниже про CI        |
| `oxlint-tsgolint` (type-aware lint от oxlint) | ок     | Использует Go-based tsgolint, не зависит от JS Compiler API    |
| Все ESLint правила без type info              | ок     | AST-only, к runtime TS не привязаны                            |
| Biome, Prettier, Stylelint, oxlint без -tsgo  | ок     | Независимы от TS                                               |

#### Что **не** работает с tsgo до TS 7.1

- `@typescript-eslint/parser` и type-aware правила (`@typescript-eslint/*`, type-aware часть `@eslint-react`).

#### Side-by-side рецепт

Пока tsgo в preview, **`tsc --noEmit` остаётся authoritative typecheck в CI**. tsgo даёт ~10× ускорение для локального pre-flight, но Microsoft явно маркирует пакет `0-dev.YYYYMMDD` и шипает новую сборку ежедневно — мелкие расхождения между tsc и tsgo возможны и временами случаются. Полагаться на tsgo как на единственный CI-чек преждевременно.

Установить оба:

```bash
pnpm add -D typescript@6 @typescript/native-preview@7.0.0-dev.20260427.1
```

Версия `@typescript/native-preview` фиксируется датированным dev-релизом, не `@beta` тегом — последний двигается каждый день и сделает рецепт нестабильным. Обновляй pin вручную по мере необходимости, пока не выйдет TS 7.0 stable.

В `package.json` сценариях:

```json
{
    "scripts": {
        "typecheck": "tsc --noEmit",
        "typecheck:fast": "tsgo --noEmit",
        "lint:eslint": "eslint --max-warnings 0 ."
    }
}
```

`typecheck` остаётся ground truth для CI и pre-commit. `typecheck:fast` для локальных итераций когда нужна скорость, не корректность последней инстанции. ESLint и редактор продолжают использовать `typescript@6` через `@typescript-eslint`. Конфликтов между `tsc` и `tsgo` бинарями нет; Microsoft также публикует `@typescript/typescript6` с `tsc6` если нужна полная изоляция.

## EditorConfig

```bash
cp node_modules/@37bytes/code-style/editorconfig/.editorconfig .
```

## Browserslist

Утилита `browserslist` принимает `extends` только для пакетов с именем `browserslist-config-*` или `@scope/browserslist-config-*`. Имя `@37bytes/code-style` под этот шаблон не подходит, поэтому пресет нельзя подключить через `extends @37bytes/code-style/browserslist` (выдаст `BrowserslistError: Browserslist config needs 'browserslist-config-' prefix`).

Рабочий вариант инлайнить массив правил в `package.json`:

```json
{
    "browserslist": [
        "last 2 Chrome versions",
        "last 2 Edge versions",
        "last 2 Opera versions",
        "last 2 Firefox versions",
        "Firefox ESR",
        "Firefox 128",
        "last 3 Safari major versions",
        "last 3 ChromeAndroid versions",
        "last 3 iOS major versions",
        "last 2 Samsung versions",
        "last 1 op_mob version"
    ]
}
```

Источник правды массива: [`browserslist/index.cjs`](./browserslist/index.cjs). Если меняется в пресете надо синхронизировать вручную в потребителях. Программный доступ из JS-конфигов:

```js
const browserslistConfig = require('@37bytes/code-style/browserslist');
```

## Naming Conventions

См. [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md).

## Лицензия

ISC
