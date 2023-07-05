import { describe, expect, test } from '@jest/globals';
import isEnvironmentExists from '../src/utils/isEnvironmentExists';

const currentDir = process.cwd();
const pathToEnvironmentsFolder = `${currentDir}\\__fixtures__\\envs`;

describe('check envs', () => {
    test('check existing env', () => {
        expect(isEnvironmentExists('before', pathToEnvironmentsFolder)).toEqual(true);
        expect(isEnvironmentExists('after', pathToEnvironmentsFolder)).toEqual(true);
    });
    test('check non-existing env', () => {
        expect(isEnvironmentExists('now', pathToEnvironmentsFolder)).toEqual(false);
    });
});
