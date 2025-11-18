[[English](./README.md)] | [Русский](./README_RU.md)

# Logstory

A flexible and extensible logger for JavaScript/TypeScript with middleware support and configurable log levels.

## Installation

```bash
npm install @37bytes/logstory
```

## Features

- Scopes
- Configurable log levels
- Middleware support for integration with Sentry, Graylog, etc.
- Works everywhere (client, server)
- Lightweight (~5KB)

## Quick Start

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

logger.debug('Debug message');  // Only in dev mode
logger.log('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

## API

### createLogstory(options)

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `string` | `undefined` | Logger name, displayed in output |
| `logLevelConfig` | `Partial<LogLevelConfig>` | All `true` | Which log levels are enabled |
| `consoleProxy` | `Console` | `globalThis.console` | Custom console implementation (for middleware) |
| `formatLoggerName` | `Function` | Default | Logger name formatting function |

#### LogLevelConfig

```typescript
type LogLevelConfig = {
  debug: boolean;
  log: boolean;
  warn: boolean;
  error: boolean;
};
```

**Note:** `logLevelConfig` is `Partial`, meaning you can specify only the levels you want to override. Unspecified levels will use their default values (all `true`).

Example:
```typescript
// Only disable debug, keep others enabled
const logger = createLogstory({
  name: 'MyApp',
  logLevelConfig: { debug: false }  // log, warn, error remain true
});
```

### Custom Formatting

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

logger.error('Critical error'); // 🔥 [MyApp] Critical error
```

## Advanced Usage

### Sentry Integration

You can extend the logger with additional methods for monitoring:

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
- Node.js support
- Migrated to tsup (CommonJS + ESM)
- Renamed `createLogger` → `createLogstory`
- Renamed `logLevelState` → `logLevelConfig`

### 1.0.0
- Initial release

## License

MIT
