import { describe, expect, test } from '@jest/globals';
import generateScript from '../src/utils/generateScript';
import getDynamicEnvironment from '../src/utils/getDynamicEnvironment';
import { join } from 'node:path';

describe('generate script', () => {
    const path = join(process.cwd(), '__tests__/.env.test');

    const env = getDynamicEnvironment({ path });
    test('returns string', () => {
        expect(typeof generateScript(env)).toBe('string');
        expect(typeof generateScript({})).toBe('string');
    });
    test('returns correct string', () => {
        expect(generateScript(env).trim()).toBe(`window.dynamicEnvironment = Object.freeze(${JSON.stringify(env)});`);
    });
});
