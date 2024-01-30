import { describe, test, expect } from '@jest/globals';
import extractLaunchArguments from '../src/utils/extractLaunchArguments';

describe('extractLaunchArguments', () => {
    test('should extract launch arguments correctly', () => {
        const originalArgv = process.argv;
        process.argv = ['node', 'script.js', 'TARGET_DIRECTORY=dir', 'ENVIRONMENT_CONFIG=env'];

        const result = extractLaunchArguments();
        expect(result).toEqual({ TARGET_DIRECTORY: 'dir', ENVIRONMENT_CONFIG: 'env' });
        process.argv = originalArgv;
    });

    test('should throw an error for missing required arguments', () => {
        const originalArgv = process.argv;
        process.argv = ['node', 'script.js'];
        expect(() => extractLaunchArguments()).toThrowError('Some required arguments missed!');

        process.argv = originalArgv;
    });
});
