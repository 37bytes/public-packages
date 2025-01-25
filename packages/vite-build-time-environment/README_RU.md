[English](./README.md) | [[Русский](./README_RU.md)]

# @37bytes/vite-build-time-environment

Этот плагин позволяет внедрять информацию о версии, ветке и коммите, зашиваемую в код на этапе сборки. Это особенно полезно для:
- Отслеживания версий в production-окружении
- Отладки проблем в различных сборках
- Автоматизации процесса релизов

## Установка

```shell
npm install @37bytes/vite-build-time-environment
```

## Использование

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import createBuildTimeIdentifiersSupportPlugin from '@37bytes/vite-build-time-environment';
import packageInfo from '../package.json';

// Остальные параметры подтягиваются из переменных окружения
const buildTimeIdentifiersSupportPlugin = createBuildTimeIdentifiersSupportPlugin({
    packageName: packageInfo.name,
    packageVersion: packageInfo.version
});

export default defineConfig({
    // ...
    plugins: [
        buildTimeIdentifiersSupportPlugin,
        // ...
    ]
    // ...
});
```

## Переменные окружения

Плагин использует следующие переменные окружения:

| Переменная окружения | Описание | Значение по умолчанию при отсутствии |
|---------------------|-----------|-------------------------------------|
| `VERSION` | Версия сборки | `[unknown build version]` |
| `BRANCH` | Текущая ветка Git | `[unknown git branch]` |
| `COMMIT_HASH` | Хеш текущего коммита | `[unknown commit hash]` |

Имена переменных окружения можно изменить через параметр `aliases` (см. раздел "Опциональные параметры").

## Параметры

### Обязательные параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `packageName` | `string` | Название пакета |
| `packageVersion` | `string` | Версия пакета |

### Опциональные параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|-----------|
| `aliases.VERSION_FIELD_NAME` | `string` | `'VERSION'` | Имя переменной окружения для версии сборки |
| `aliases.BRANCH_FIELD_NAME` | `string` | `'BRANCH'` | Имя переменной окружения для ветки Git |
| `aliases.COMMIT_HASH_FIELD_NAME` | `string` | `'COMMIT_HASH'` | Имя переменной окружения для хеша коммита |

## Доступные переменные

После настройки плагина в вашем коде будут доступны следующие глобальные переменные:

| Переменная | Описание |
|------------|----------|
| `PACKAGE_INFO_FIELD_NAME` | Название пакета |
| `PACKAGE_INFO_FIELD_VERSION` | Версия пакета |
| `BUILD_TIME_VARIABLES_VERSION` | Версия сборки (из переменной окружения) |
| `BUILD_TIME_VARIABLES_BRANCH` | Текущая ветка Git |
| `BUILD_TIME_VARIABLES_COMMIT_HASH` | Хеш текущего коммита |
| `BUILD_TIME_VARIABLES_RELEASE_NAME` | Полное название релиза в формате `packageName@packageVersion+version` |

### Пример сборки

```shell
VERSION=1.0.0-beta BRANCH=feature/new-plugin COMMIT_HASH=abc123 vite build
```

## Пример использования в коде

vite-end.d.ts:
```typescript
// ...
/// <reference types="@37bytes/vite-build-time-environment/client" />
// ...
```

```typescript
export const packageInfo = {
    name: PACKAGE_INFO_FIELD_NAME,
    version: PACKAGE_INFO_FIELD_VERSION
};

export const buildTimeVariables = {
    version: BUILD_TIME_VARIABLES_VERSION,
    branch: BUILD_TIME_VARIABLES_BRANCH,
    commitHash: BUILD_TIME_VARIABLES_COMMIT_HASH,
    releaseName: BUILD_TIME_VARIABLES_RELEASE_NAME
};
```

## Пример с настройкой алиасов

```typescript
buildTimeIdentifiersPlugin({
    packageName: 'my-app',
    packageVersion: '1.0.0',
    aliases: {
        VERSION_FIELD_NAME: 'MY_APP_VERSION',
        BRANCH_FIELD_NAME: 'MY_APP_BRANCH',
        COMMIT_HASH_FIELD_NAME: 'MY_APP_COMMIT'
    }
})
```

## Значения по умолчанию

Если соответствующие переменные окружения не установлены, плагин использует следующие значения:

- Для `BUILD_TIME_VARIABLES_BRANCH`: `[unknown git branch]`
- Для `BUILD_TIME_VARIABLES_COMMIT_HASH`: `[unknown commit hash]`
- Для `BUILD_TIME_VARIABLES_VERSION`: `[unknown build version]`
