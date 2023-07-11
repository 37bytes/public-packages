# Logstory

Logstory is a flexible and extensible logger for JavaScript that allows easy integration of additional features and sending events to monitoring systems such as Sentry or Graylog.

## Key Features:
- **Easy Integration**: The logger provides a convenient interface for embedding additional functions and middleware, allowing easy customization of its behavior according to the application's needs.
- **Middleware Support**: The logger allows passing middleware that can handle or send events when warnings or errors occur. This enables integration with monitoring systems such as Sentry or Graylog for centralized log collection and analysis.
- **Configurable Log Level**: The logger supports a customizable log level, allowing you to control the output of different message levels (debug, log, warn, error) based on your application requirements.
- **Development Environment Support**: The logger automatically adapts to the development environment, allowing you to manage the log level based on the environment (e.g., enabling debug messages only in development mode).

## Installation:
* npm
  ```sh
  npm install npm@latest -g
  ```

## Basic Usage:

```typescript
// file createLogger.ts

import {
  applyConsoleProxyMiddleware,
  CreateLoggerParams,
  createLogstory,
  Logger,
  LogLevelState,
  MiddlewareFunction
} from '@37bytes/logstory';

// default settings
const defaultLogLevelState: LogLevelState = {
  debug: import.meta.env.DEV,
  log: import.meta.env.DEV,
  warn: true,
  error: true
};

export const createSimplePureLogger = (name: CreateLoggerParams['name']): Logger =>
  createLogstory({ name, logLevelState: defaultLogLevelState, consoleProxy: window.console });

// developming features
if (import.meta.env.DEV) {
  window.developingFeatures = window.developingFeatures || {};
  window.developingFeatures.createLogger = createLogstory;
  window.developingFeatures.createSimplePureLogger = createSimplePureLogger;
  createSimplePureLogger('createLogger').debug(
    'createLogger/createSimplePureLogger are available in window.developingFeatures'
  );
}
```

```tsx
// module Example.tsx
const pureLogger = createSimplePureLogger('Test')

useEffect(() => {
  logger.debug('Debug message');
  logger.log('Log message');
  logger.warn('Warning message');
  logger.error('Error message');
}, [])

```


## Advanced Usage:
If you want to use Sentry or GrayLog with your logger, create a special console proxy and apply the `applyConsoleProxyMiddleware` function found in the package

```typescript
// file createLogger.ts
import getTrackingServicesConsoleProxy from './getTrackingServicesConsoleProxy';
import {
  applyConsoleProxyMiddleware,
  CreateLoggerParams,
  createLogstory,
  Logger,
  LogLevelState,
  MiddlewareFunction
} from '@37bytes/logstory';

// default settings
const defaultLogLevelState: LogLevelState = {
  ebug: import.meta.env.DEV,
  log: import.meta.env.DEV,
  warn: true,
  error: true
};

// define your services for applyConsoleProxyMiddleware
export enum MiddlewareExtras {
  SENTRY = 'sentryExtra',
  GREY_LOG = 'greylogExtra'
}
export type ApplyMiddlewareMessage = unknown;
// you can specify different data
export type ApplyMiddlewareExtras = {
  [MiddlewareExtras.SENTRY]?: { tags: { loggerName: string } } // or & Record<string, unknown>;
  [MiddlewareExtras.GREY_LOG]?: { data: string[] } // or & Record<string, unknown>;
};

export type MiddlewareFunctionCallbackType = MiddlewareFunction<ApplyMiddlewareMessage, ApplyMiddlewareExtras>;

// Senrty 
const initSentry: MiddlewareFunctionCallbackType = ({ message, extras }) => {
  const { sentryExtra } = extras;
  Sentry.captureException(message, sentryExtra);
};

// Graylog
const initGrayLog: MiddlewareFunctionCallbackType = ({ message, extras }) => {
  const { greylogExtra } = extras;
  graylogLogger.warning(message as string, greylogExtra);
};

export const createSentryLogger = ({ name, logLevelState = defaultLogLevelState }: CreateLoggerParams = {}): Logger =>
  createLogger({
    name,
    logLevelState,
    consoleProxy: getTrackingServicesConsoleProxy(
        name,
        // use your console proxy and applyConsoleProxyMiddleware
        applyConsoleProxyMiddleware<ApplyMiddlewareMessage, ApplyMiddlewareExtras, MiddlewareFunctionCallbackType>([
            initSentry,
            initGrayLog
        ])
    )
});

export const createSimpleSentryLogger = (name: CreateLoggerParams['name']) => createSentryLogger({ name });

// developming features
if (import.meta.env.DEV) {
  window.developingFeatures = window.developingFeatures || {};
  window.developingFeatures.createSentryLogger = createSentryLogger;
  window.developingFeatures.createSimpleSentryLogger = createSimpleSentryLogger;
  createSimplePureLogger('createLogger').debug(
    'createLogger/createSentryLogger/createSimpleSentryLogger are available in window.developingFeatures'
  );
}

```

```typescript
// file getTrackingServicesConsoleProxy.ts
import { LogLevel } from '@37bytes/logstory';
import { MiddlewareExtras, MiddlewareFunctionCallbackType } from './createLogger';

const sanitizePrefix = (prefix: unknown = '') => {
  if (typeof prefix !== 'string') {
    return '';
  }

  const startIndex = prefix.indexOf('[');
  if (startIndex >= 0) {
    return prefix.substring(startIndex);
  }

  return prefix;
};

const getTrackingServicesConsoleProxy = (
  loggerName: string = 'unknown',
  applyMiddleware: MiddlewareFunctionCallbackType
): Console =>
  new Proxy(console, {
    get(target, propKey, receiver) {
      switch (propKey as LogLevel) {
        case 'error':
            return function (...args: unknown[]) {
              // handle error and send data
              const [, error, extra] = args;
              applyMiddleware({
                message: error,
                extras: {
                  [MiddlewareExtras.SENTRY]: { tags: { loggerName } },
                  [MiddlewareExtras.GREY_LOG]: extra as ApplyMiddlewareExtras['graylogExtra']
                }
              });
              return Reflect.get(target, propKey, receiver)(...args);
        };
        case 'warn':
          return function (...args: unknown[]) {
              // handle warning and send data
              const [prefix, message, extra] = arguments;
              const fullMessage =
                  typeof message === 'string'
                      ? sanitizePrefix(prefix).replace('%o', message)
                      : 'Strange warning';

              applyMiddleware({
                  message: fullMessage,
                  extras: {
                      [MiddlewareExtras.SENTRY]: { tags: { loggerName } },
                      [MiddlewareExtras.GREY_LOG]: extra
                  }
              });

              return Reflect.get(target, propKey, receiver)(...args);
        };
        default:
            return Reflect.get(target, propKey, receiver);
      }
    }
  });

export default getTrackingServicesConsoleProxy;
```

```typescript
const logger = createSimpleSentryLogger('example');
logger.warn('Warn message')
logger.error(Error, { data: ['some data'] })

```

## Issues
See the [open issues](https://github.com/37bytes/prepare-environment/Best-README-Template/issues) for a full list of proposed features (and known issues).
