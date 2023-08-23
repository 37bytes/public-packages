import { describe, expect, test } from '@jest/globals';
import checkEnvironmentExists from '../src/utils/checkEnvironmentExists';
import path from 'path';

const pathToEnvironmentsFolder = path.join(process.cwd(), '__fixtures__', 'envs/');

describe('checkEnvironmentExists', () => {
    test('check existing env', () => {
        expect(checkEnvironmentExists('before', pathToEnvironmentsFolder)).toEqual(true);
        expect(checkEnvironmentExists('after', pathToEnvironmentsFolder)).toEqual(true);
    });
    test('check non-existing env', () => {
        expect(checkEnvironmentExists('now', pathToEnvironmentsFolder)).toEqual(false);
    });
});
