import cp from 'child_process';
import path from 'path';
import { describe, expect, test } from '@jest/globals';

const scriptPath = path.join(__dirname, '..', 'src/', 'index.ts');

const getFixturePath = (filename: string) => path.join(__dirname, '..', '__fixtures__', filename);

const configPath = getFixturePath('.preparerc');
const configPathWithError = getFixturePath('.prepareErrorrc');

const configPathRoot = path.join(__dirname, '..');
const ENV_NAME_MOCK = 'ENV_NAME=test';

const testPaths = {
    scriptPath,
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
        scriptCode: cp.spawnSync('ts-node', [testPaths.scriptPath, testPaths.configPahWithError, ENV_NAME_MOCK], {
            shell: true
        }).status,
        expectedCode: 1
    },
    // there is no json in the root
    {
        scriptCode: cp.spawnSync('ts-node', [testPaths.scriptPath, testPaths.configPathRoot, ENV_NAME_MOCK], {
            shell: true
        }).status,
        expectedCode: 1
    },
    // required ENV_NAME is undefined
    {
        scriptCode: cp.spawnSync('ts-node', [testPaths.scriptPath, testPaths.configPathRoot], {
            shell: true
        }).status,
        expectedCode: 1
    }
];

describe('cli', () => {
    test('get config with success', () => {
        const make = cp.spawnSync('ts-node', [testPaths.scriptPath, testPaths.configPath, ENV_NAME_MOCK], {
            shell: true
        });
        const result = make.stdout.toString('utf8');

        console.debug(`testConfig=${result}`);
        expect(result).toContain(mockLogText);
    });
    test.each(testTable)('all error cases', ({ scriptCode, expectedCode }) => {
        expect(scriptCode).toBe(expectedCode);
    });
});
