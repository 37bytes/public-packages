import cp from 'child_process';
import path from 'path';
import { describe, expect, test } from '@jest/globals';

const filePath = path.join(__dirname, '..', 'src/', 'index.ts');

const configPath = path.join(__dirname, '..', '__fixtures__/', '.preparerc');
const configPathWithError = path.join(__dirname, '..', '__fixtures__/', '.prepareErrorrc');
const configPathRoot = path.join(__dirname, '..');
const ENV_NAME_MOCK = 'ENV_NAME=test';

const script = {
    filePath,
    configPath: `CONFIG_PATH=${configPath}`,
    configPahWithError: `CONFIG_PATH=${configPathWithError}`,
    configPathRoot
};

const mockLogText =
    'The configuration has been received, start prepareEnvironment {\n' +
    "  environmentsFolder: './environments',\n" +
    "  resultConfig: './.env.production',\n" +
    "  allowedEnvironments: [ 'legacy_prod', 'legacy_stage', 'legacy_odr', 'stage', 'prod' ],\n" +
    "  variablePrefix: 'REACT_APP_'\n" +
    '}\n';

const testTable: Array<{ scriptCode: number; expectedCode: number }> = [
    // json with error
    {
        scriptCode: cp.spawnSync('ts-node', [script.filePath, script.configPahWithError, ENV_NAME_MOCK], {
            shell: true
        }).status,
        expectedCode: 1
    },
    // there is no json in the root
    {
        scriptCode: cp.spawnSync('ts-node', [script.filePath, script.configPathRoot, ENV_NAME_MOCK], {
            shell: true
        }).status,
        expectedCode: 1
    },
    // required ENV_NAME is undefined
    {
        scriptCode: cp.spawnSync('ts-node', [script.filePath, script.configPathRoot], {
            shell: true
        }).status,
        expectedCode: 1
    }
];

describe('cli', () => {
    test('get config with success', () => {
        const make = cp.spawnSync('ts-node', [script.filePath, script.configPath, ENV_NAME_MOCK], { shell: true });
        const result = make.stdout.toString('utf8');

        console.debug(`testConfig=${result}`);
        expect(result).toContain(mockLogText);
    });
    test.each(testTable)('all error cases', ({ scriptCode, expectedCode }) => {
        expect(scriptCode).toBe(expectedCode);
    });
});
