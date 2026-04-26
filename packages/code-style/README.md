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
| `fsdConfig()`         | Ограничения архитектуры FSD            |

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
