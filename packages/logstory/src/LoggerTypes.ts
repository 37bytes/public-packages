export type LogLevel = 'debug' | 'log' | 'warn' | 'error';
export type Logger = Record<LogLevel, (...args: unknown[]) => void>;
export type LogLevelState = Record<LogLevel, boolean>;

export interface FormatLoggerNameParams {
    loggerName: string;
    logLevel: LogLevel;
}
export interface CreateLoggerParams {
    name?: string;
    logLevelState?: Partial<LogLevelState>;
    consoleProxy?: Console;
    formatLoggerName?: ({ loggerName, logLevel }: FormatLoggerNameParams) => string;
}
