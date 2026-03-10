import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogstory } from '../createLogstory';
import type { FormatLoggerNameParams } from '../createLogstory';

describe('createLogstory', () => {
    let mockConsole: Console;

    beforeEach(() => {
        mockConsole = {
            debug: vi.fn(),
            log: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        } as unknown as Console;
    });

    describe('Basic functionality', () => {
        it('should create logger with all methods', () => {
            const logger = createLogstory({ consoleProxy: mockConsole });

            expect(logger).toBeDefined();
            expect(typeof logger.debug).toBe('function');
            expect(typeof logger.log).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.error).toBe('function');
        });

        it.each([
            ['debug', 'debug'],
            ['log', 'log'],
            ['warn', 'warn'],
            ['error', 'error']
        ] as const)('should log %s messages with correct format', (level, method) => {
            const logger = createLogstory({ name: 'TestLogger', consoleProxy: mockConsole });

            logger[level]('test message');

            expect(mockConsole[method]).toHaveBeenCalledWith('[TestLogger]: %o', 'test message');
            expect(mockConsole[method]).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple arguments', () => {
            const logger = createLogstory({ name: 'TestLogger', consoleProxy: mockConsole });

            logger.log('message', { key: 'value' }, 123);

            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'message', { key: 'value' }, 123);
        });

        it('should work without name parameter', () => {
            const logger = createLogstory({ consoleProxy: mockConsole });

            logger.log('test');

            expect(mockConsole.log).toHaveBeenCalledWith('%o', 'test');
        });

        it('should work with empty name', () => {
            const logger = createLogstory({ name: '', consoleProxy: mockConsole });

            logger.log('test');

            expect(mockConsole.log).toHaveBeenCalledWith('%o', 'test');
        });

        it('should work without any parameters', () => {
            const logger = createLogstory();

            expect(logger).toBeDefined();
            expect(typeof logger.debug).toBe('function');
            expect(typeof logger.log).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.error).toBe('function');
        });
    });

    describe('logLevelConfig', () => {
        it.each([
            ['debug', 'log'],
            ['log', 'debug'],
            ['warn', 'error'],
            ['error', 'warn']
        ] as const)('should disable %s when set to false', (disabledLevel, enabledLevel) => {
            const config = { debug: true, log: true, warn: true, error: true, [disabledLevel]: false };
            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: config,
                consoleProxy: mockConsole
            });

            logger[disabledLevel]('should not be logged');
            logger[enabledLevel]('should be logged');

            expect(mockConsole[disabledLevel]).not.toHaveBeenCalled();
            expect(mockConsole[enabledLevel]).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
        });

        it('should disable multiple log levels', () => {
            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: { debug: false, log: true, warn: false, error: true },
                consoleProxy: mockConsole
            });

            logger.debug('should not be logged');
            logger.warn('should not be logged');
            logger.log('should be logged');
            logger.error('should be logged');

            expect(mockConsole.debug).not.toHaveBeenCalled();
            expect(mockConsole.warn).not.toHaveBeenCalled();
            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
            expect(mockConsole.error).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
        });

        it('should handle all levels disabled', () => {
            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: { debug: false, log: false, warn: false, error: false },
                consoleProxy: mockConsole
            });

            logger.debug('should not be logged');
            logger.log('should not be logged');
            logger.warn('should not be logged');
            logger.error('should not be logged');

            expect(mockConsole.debug).not.toHaveBeenCalled();
            expect(mockConsole.log).not.toHaveBeenCalled();
            expect(mockConsole.warn).not.toHaveBeenCalled();
            expect(mockConsole.error).not.toHaveBeenCalled();
        });

        it('should merge partial logLevelConfig with defaults', () => {
            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: { debug: false },
                consoleProxy: mockConsole
            });

            logger.debug('should not be logged');
            logger.log('should be logged');
            logger.warn('should be logged');
            logger.error('should be logged');

            expect(mockConsole.debug).not.toHaveBeenCalled();
            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
            expect(mockConsole.warn).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
            expect(mockConsole.error).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
        });

        it('should handle empty logLevelConfig by using all defaults', () => {
            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: {},
                consoleProxy: mockConsole
            });

            logger.debug('should be logged');
            logger.log('should be logged');

            expect(mockConsole.debug).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'should be logged');
        });
    });

    describe('formatLoggerName', () => {
        it('should use custom formatter with correct output and parameters', () => {
            const formatterSpy = vi.fn(
                ({ loggerName, logLevel }: FormatLoggerNameParams) => `${logLevel.toUpperCase()} | ${loggerName}:`
            );

            const logger = createLogstory({
                name: 'CustomLogger',
                formatLoggerName: formatterSpy,
                consoleProxy: mockConsole
            });

            logger.debug('test');

            expect(formatterSpy).toHaveBeenCalledWith({ loggerName: 'CustomLogger', logLevel: 'debug' });
            expect(mockConsole.debug).toHaveBeenCalledWith('DEBUG | CustomLogger:', 'test');
        });

        it('should use default formatter when not provided', () => {
            const logger = createLogstory({
                name: 'TestLogger',
                consoleProxy: mockConsole
            });

            logger.log('test');

            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'test');
        });

        it('should handle formatter that returns empty string', () => {
            const emptyFormatter = () => '';
            const logger = createLogstory({
                name: 'TestLogger',
                formatLoggerName: emptyFormatter,
                consoleProxy: mockConsole
            });

            logger.log('test');

            expect(mockConsole.log).toHaveBeenCalledWith('', 'test');
        });
    });

    describe('consoleProxy', () => {
        it('should use custom console proxy', () => {
            const customConsole = {
                debug: vi.fn(),
                log: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            } as unknown as Console;

            const logger = createLogstory({
                name: 'TestLogger',
                consoleProxy: customConsole
            });

            logger.log('test');

            expect(customConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'test');
            expect(mockConsole.log).not.toHaveBeenCalled();
        });

        it('should use globalThis.console by default', () => {
            const logger = createLogstory({ name: 'TestLogger' });

            expect(() => {
                logger.log('test');
            }).not.toThrow();
        });
    });

    describe('Integration scenarios', () => {
        it('should work in SSR environment (Node.js)', () => {
            const logger = createLogstory({ name: 'SSRTest' });

            expect(() => {
                logger.debug('test');
                logger.log('test');
                logger.warn('test');
                logger.error('test');
            }).not.toThrow();
        });

        it('should combine custom formatter and disabled levels', () => {
            const customFormatter = ({ loggerName, logLevel }: FormatLoggerNameParams) => `[${logLevel}] ${loggerName}`;

            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: { debug: false, log: true, warn: true, error: true },
                formatLoggerName: customFormatter,
                consoleProxy: mockConsole
            });

            logger.debug('should not appear');
            logger.log('should appear');

            expect(mockConsole.debug).not.toHaveBeenCalled();
            expect(mockConsole.log).toHaveBeenCalledWith('[log] TestLogger', 'should appear');
        });
    });

    describe('Edge cases', () => {
        it('should handle complex nested objects', () => {
            const logger = createLogstory({ name: 'TestLogger', consoleProxy: mockConsole });
            const complexObject = {
                nested: { deep: { value: 'test' } },
                array: [1, 2, 3],
                fn: () => {}
            };

            logger.log('Complex object:', complexObject);

            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', 'Complex object:', complexObject);
        });

        it('should handle null and undefined values', () => {
            const logger = createLogstory({ name: 'TestLogger', consoleProxy: mockConsole });

            logger.log(null);

            expect(mockConsole.log).toHaveBeenCalledWith('[TestLogger]: %o', null);
        });

        it('should not throw when disabled logger methods are called', () => {
            const logger = createLogstory({
                name: 'TestLogger',
                logLevelConfig: { debug: false, log: false, warn: false, error: false },
                consoleProxy: mockConsole
            });

            expect(() => {
                logger.debug('test');
                logger.log('test');
                logger.warn('test');
                logger.error('test');
            }).not.toThrow();
        });
    });
});
