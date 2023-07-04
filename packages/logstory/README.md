# Logstory

Logstory is a flexible and extensible logger for JavaScript that allows easy integration of additional features and sending events to monitoring systems such as Sentry or Graylog.

## Key Features:
- **Easy Integration**: The logger provides a convenient interface for embedding additional functions and middleware, allowing easy customization of its behavior according to the application's needs.
- **Middleware Support**: The logger allows passing middleware that can handle or send events when warnings or errors occur. This enables integration with monitoring systems such as Sentry or Graylog for centralized log collection and analysis.
- **Configurable Log Level**: The logger supports a customizable log level, allowing you to control the output of different message levels (debug, log, warn, error) based on your application requirements.
- **Development Environment Support**: The logger automatically adapts to the development environment, allowing you to manage the log level based on the environment (e.g., enabling debug messages only in development mode).

Documentation and usage examples are available in the [GitHub repository](https://github.com/your-username/your-repo).

## Installation:


## Example Usage:

```javascript
import { createLogger } from 'extendable-js-logger';

// Create a logger with default settings
const logger = createLogger();

// Example usage of the logger
logger.debug('Debug message');
logger.log('Log message');
logger.warn('Warning message');
logger.error('Error message');

// Example of adding middleware for sending events to Sentry or Graylog
const sentryMiddleware = (level, message) => {
  if (level === 'warn' || level === 'error') {
    // Send event to Sentry
    // ...
  }
};

logger.addMiddleware(sentryMiddleware);

// Now, warnings (warn) and errors (error) will be sent to Sentry
