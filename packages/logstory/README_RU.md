[English](./README.md) | [[Русский](./README_RU.md)]

# Logstory

Гибкий и расширяемый логгер для JavaScript/TypeScript с поддержкой middleware и настраиваемыми уровнями логирования.

## Установка

```bash
npm install @37bytes/logstory
```

## Возможности

- Scope'ы
- Настраиваемые уровни
- Поддержка middleware для интеграции с Sentry, Graylog, etc.
- Работает везде (client, server)
- Легковесный (~5KB)

## Быстрый старт

```typescript
import { createLogstory } from '@37bytes/logstory';

const logger = createLogstory({
  name: 'Scope',
  logLevelConfig: {
    debug: process.env.NODE_ENV === 'development',
    log: true,
    warn: true,
    error: true
  }
});

logger.debug('Отладочное сообщение');  // Только в dev режиме
logger.log('Информация');
logger.warn('Предупреждение');
logger.error('Ошибка');
```

## API

### createLogstory(options)

#### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `name` | `string` | `undefined` | Имя логгера, отображается в выводе |
| `logLevelConfig` | `Partial<LogLevelConfig>` | Все `true` | Какие уровни логирования включены |
| `consoleProxy` | `Console` | `globalThis.console` | Кастомная реализация console (для middleware) |
| `formatLoggerName` | `Function` | По умолчанию | Функция форматирования имени логгера |

#### LogLevelConfig

```typescript
type LogLevelConfig = {
  debug: boolean;
  log: boolean;
  warn: boolean;
  error: boolean;
};
```

**Примечание:** `logLevelConfig` имеет тип `Partial`, то есть можно указать только те уровни, которые хотите переопределить. Неуказанные уровни будут использовать значения по умолчанию (все `true`).

Пример:
```typescript
// Отключить только debug, остальные остаются включенными
const logger = createLogstory({
  name: 'MyApp',
  logLevelConfig: { debug: false }  // log, warn, error остаются true
});
```

### Дополнительное форматирование

```typescript
const logger = createLogstory({
  name: 'MyApp',
  formatLoggerName: ({ loggerName, logLevel }) => {
    if (logLevel === 'error') {
      return `🔥 [${loggerName}]: %o`;
    }
    return `[${loggerName}]: %o`;
  }
});

logger.error('Критическая ошибка'); // 🔥 [MyApp] Критическая ошибка
```

## Продвинутое использование

### Интеграция с Sentry

Можно расширить логгер дополнительными методами для отправки в мониторинг:

```typescript
import { createLogstory } from '@37bytes/logstory';
import * as Sentry from '@sentry/browser';

const createLogger = (name: string) => {
  const logger = createLogstory({ name });
  
  logger.error.withSentry = (error, context) => {
    logger.error(error);
    Sentry.captureException(error, { extra: context });
  };

  return logger;
};

const logger = createLogger('PaymentService');
logger.error.withSentry(new Error('Payment failed'), { userId: '123' });
```

## Changelog

### 2.0.0
- Поддержка Node.JS
- Миграция на tsup (CommonJS + ESM)
- Переименование `createLogger` → `createLogstory`
- Переименование `logLevelState` → `logLevelConfig`

### 1.0.0
- Первый релиз

## Лицензия

MIT
