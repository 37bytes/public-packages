import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import mock from 'mock-fs';
import { readFileSync } from 'fs';
import * as path from 'path';
import prepareEnvironment from '../src/prepareEnviroment';
import * as fs from 'fs';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', 'envs/', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const envFileAfter = readFile('.evn.after');

const cliArguments = {
    ENV_NAME: 'stage',
    CAL_VER: undefined,
    COMMIT_SHORT_SHA: undefined,
    REF_NAME: undefined,
    CONFIG_PATH: undefined
};
const cliArgumentsForError = {
    ...cliArguments,
    ENV_NAME: 'prod'
};
const appName = 'test-app@1.0.0';

const getConfigData = (syntheticPath: string) => {
    return {
        environmentsFolder: `${syntheticPath}/testProject/environments/`,
        resultConfig: `${syntheticPath}/testProject/.env.production`,
        variablePrefix: 'REACT_APP_'
    };
};

const getPreparedEnvFile = (syntheticPath: string): string => {
    const pathToPreparedEnv = `${syntheticPath}/testProject/.env.production`;
    return readFileSync(pathToPreparedEnv, 'utf-8');
};

describe('prepareEnvironment', () => {
    beforeEach(() => {
        mock({
            testProject: {
                environments: {
                    '.env.stage': mock.load(getFixturePath('.env.before')),
                    '.env.prod': mock.load(getFixturePath('.env.before'))
                }
            }
        });
    });

    afterEach(() => {
        mock.restore();
    });

    const currentDir = process.cwd();
    const configData = getConfigData(currentDir);

    test('modify env file with success', () => {
        prepareEnvironment({ configData, cliArguments, appName });

        const preparedEnvFile = getPreparedEnvFile(currentDir);

        expect(preparedEnvFile).toEqual(envFileAfter);
    });
    test('modify env file with error, different ENV_NAME', () => {
        prepareEnvironment({ configData, cliArguments: cliArgumentsForError, appName });

        const preparedEnvFile = getPreparedEnvFile(currentDir);

        expect(preparedEnvFile).not.toEqual(envFileAfter);
    });
});
