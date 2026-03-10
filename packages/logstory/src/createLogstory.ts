export type LogLevel = 'debug' | 'log' | 'warn' | 'error';
export type LogLevelConfig = Record<LogLevel, boolean>;
export type Logger = Record<LogLevel, (...args: unknown[]) => void>;

const defaultLogLevelState: LogLevelConfig = {
    debug: true,
    log: true,
    warn: true,
    error: true
};

export interface FormatLoggerNameParams {
    loggerName?: string;
    logLevel: LogLevel;
}

const format = ({ loggerName }: FormatLoggerNameParams) => (loggerName ? `[${loggerName}]: %o` : '%o');

export interface CreateLogstoryParams {
    name?: string;
    logLevelConfig?: Partial<LogLevelConfig>;
    consoleProxy?: Console;
    formatLoggerName?: ({ loggerName, logLevel }: FormatLoggerNameParams) => string;
}

export const createLogstory = ({
    name,
    logLevelConfig,
    consoleProxy = globalThis.console,
    formatLoggerName = format
}: CreateLogstoryParams = {}): Logger => {
    const mergedConfig: LogLevelConfig = {
        ...defaultLogLevelState,
        ...logLevelConfig
    };

    const logger: Logger = {
        debug: consoleProxy.debug.bind(
            consoleProxy,
            formatLoggerName({ loggerName: name, logLevel: 'debug' })
        ) as Logger['debug'],
        log: consoleProxy.log.bind(
            consoleProxy,
            formatLoggerName({ loggerName: name, logLevel: 'log' })
        ) as Logger['log'],
        warn: consoleProxy.warn.bind(
            consoleProxy,
            formatLoggerName({ loggerName: name, logLevel: 'warn' })
        ) as Logger['warn'],
        error: consoleProxy.error.bind(
            consoleProxy,
            formatLoggerName({ loggerName: name, logLevel: 'error' })
        ) as Logger['error']
    };

    (Object.keys(logger) as Array<LogLevel>).forEach((key) => {
        if (!mergedConfig[key]) {
            logger[key] = () => {};
        }
    });

    return logger;
};
