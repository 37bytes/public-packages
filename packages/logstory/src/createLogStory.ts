import { CreateLoggerParams, FormatLoggerNameParams, Logger, LogLevel, LogLevelState } from './LoggerTypes';

const defaultLogLevelState: LogLevelState = {
    debug: true,
    log: true,
    warn: true,
    error: true
};

const defaultFormat = ({ loggerName, logLevel }: FormatLoggerNameParams) => {
    // %o https://stackoverflow.com/a/42406361/2973464
    switch (logLevel) {
        case 'debug':
            return `🥷[${loggerName}]: %o`;
        case 'log':
            return `[${loggerName}]: %o`;
        case 'warn':
            return `😕😕😕️\n[${loggerName}]: %o`;
        case 'error':
            return `🔥🔥🔥🔥🔥🔥\n[${loggerName}]: %o`;
        default:
            return `[${loggerName}]: %o`;
    }
};

export function createLogstory({
    name,
    logLevelState = defaultLogLevelState,
    consoleProxy = window.console,
    formatLoggerName = defaultFormat
}: CreateLoggerParams = {}): Logger {
    const logger: Logger = {
        debug: consoleProxy.debug.bind(window.console, formatLoggerName({ loggerName: name, logLevel: 'debug' })),
        log: consoleProxy.log.bind(window.console, formatLoggerName({ loggerName: name, logLevel: 'log' })),
        warn: consoleProxy.warn.bind(window.console, formatLoggerName({ loggerName: name, logLevel: 'warn' })),
        error: consoleProxy.error.bind(window.console, formatLoggerName({ loggerName: name, logLevel: 'error' }))
    };

    (Object.keys(logger) as Array<LogLevel>).forEach((key) => {
        if (!logLevelState[key]) {
            logger[key] = () => {};
        }
    });

    return logger;
}
