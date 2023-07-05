export type LogLevel = 'debug' | 'log' | 'warn' | 'error';
export type Logger = Record<LogLevel, (...args: unknown[]) => void>;
export type LogLevelState = Record<LogLevel, boolean>;
