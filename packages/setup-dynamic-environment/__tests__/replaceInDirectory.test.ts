import { beforeEach, describe, test, expect, jest, afterEach } from '@jest/globals';
import replaceInDirectory from '../src/utils/replaceInDirectory';
import replaceInFile from '../src/utils/replaceInFile';
import mock from 'mock-fs';
import path from 'path';

jest.mock('../src/utils/replaceInFile');

describe('replaceInDirectory', () => {
    beforeEach(() => {
        mock({
            '/testDirectory': {
                'file1.js': 'content1',
                'file2.js': 'content2',
                subdir: {
                    'file3.js': 'content3',
                    'file4.txt': 'textfile'
                }
            }
        });
    });

    afterEach(() => {
        mock.restore();
    });

    test('should recursively replace strings in JS files', () => {
        const dynamicEnvironment = { key: 'value' };

        jest.spyOn(global.console, 'log');

        replaceInDirectory('/testDirectory', dynamicEnvironment);

        const normalizedPaths = [
            path.normalize('/testDirectory/file1.js'),
            path.normalize('/testDirectory/file2.js'),
            path.normalize('/testDirectory/subdir/file3.js')
        ];

        expect(global.console.log).toHaveBeenCalledWith('calling replaceInFile...', normalizedPaths[0]);
        expect(global.console.log).toHaveBeenCalledWith('calling replaceInFile...', normalizedPaths[1]);
        expect(global.console.log).toHaveBeenCalledWith('calling replaceInFile...', normalizedPaths[2]);
        expect(global.console.log).toHaveBeenCalledTimes(3);

        expect(replaceInFile).toHaveBeenCalledTimes(3);

        expect(replaceInFile).toHaveBeenCalledWith(normalizedPaths[0], dynamicEnvironment);
        expect(replaceInFile).toHaveBeenCalledWith(normalizedPaths[1], dynamicEnvironment);
        expect(replaceInFile).toHaveBeenCalledWith(normalizedPaths[2], dynamicEnvironment);
    });
});
