import { CreateLoggerParams, Logger, LogLevel, LogLevelState } from './LoggerTypes';

const defaultLogLevelState: LogLevelState = {
    debug: true,
    log: true,
    warn: true,
    error: true
};

export function createLogstory({
    name,
    logLevelState = defaultLogLevelState,
    consoleProxy = window.console
}: CreateLoggerParams = {}): Logger {
    const loggerName = name ? `[${name}]: ` : '';
    // https://stackoverflow.com/a/42406361/2973464
    const logger: Logger = {
        debug: consoleProxy.debug.bind(window.console, `🥷${loggerName}%o`),
        log: consoleProxy.log.bind(window.console, `${loggerName}%o`),
        warn: consoleProxy.warn.bind(window.console, `😕😕😕️\n${loggerName}%o`),
        error: consoleProxy.error.bind(window.console, `🔥🔥🔥🔥🔥🔥\n${loggerName}%o`)
    };

    (Object.keys(logger) as Array<LogLevel>).forEach((key) => {
        if (!logLevelState[key]) {
            logger[key] = () => {};
        }
    });

    return logger;
}
