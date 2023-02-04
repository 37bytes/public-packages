import cp from 'child_process';
import path from 'path';
import { describe, expect, test } from '@jest/globals';

const filePath = path.join(__dirname, '..', 'src/', 'index.ts');

const configPath = path.join(__dirname, '..', '__fixtures__/', '.preparerc');
const configPathWithError = path.join(__dirname, '..', '__fixtures__/', '.prepareErrorrc');
const configPathRoot = path.join(__dirname, '..');

const script = {
    filePath,
    configPath: `CONFIG_PATH=${configPath}`,
    configPahWithError: `CONFIG_PATH=${configPathWithError}`,
    configPathRoot
};

const mockLogText = "The configuration has been received { port: '3001_test', foo: 'bar_test' }";

describe('cli', () => {
    test('get config with success', () => {
        const make = cp.spawnSync('ts-node', [script.filePath, script.configPath], { shell: true });
        const result = make.stdout.toString('utf8');

        console.debug(`testConfig=${result}`);
        expect(result).toContain(mockLogText);
    });
    test('get config with error', () => {
        const makeFolderConfig = cp.spawnSync('ts-node', [script.filePath, script.configPahWithError], {
            shell: true
        });
        const makeRootConfig = cp.spawnSync('ts-node', [script.filePath, script.configPathRoot], { shell: true });
        let exitCodeFolder = makeFolderConfig.status;
        let exitCodeRoot = makeRootConfig.status;
        console.debug(`Received an error during script execution`);
        expect(exitCodeFolder).toBe(1);
        expect(exitCodeRoot).toBe(1);
    });
});
