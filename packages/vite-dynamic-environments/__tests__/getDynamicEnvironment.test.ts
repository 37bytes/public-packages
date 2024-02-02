import { describe, expect, test } from '@jest/globals';
import getDynamicEnvironment from '../src/utils/getDynamicEnvironment';
import { join } from 'node:path';

describe('get env variables from file', () => {
    const path = join(process.cwd(), '__tests__/.env.test');
    test('without ignored prefixes', () => {
        expect(JSON.stringify(getDynamicEnvironment({ path }))).toBe(
            JSON.stringify({
                VAR_ONE: 'var_one',
                VAR_TWO: 'var_two',
                CONST_ONE: 'const_one',
                CONST_TWO: 'const_two'
            })
        );
    });
    test('with ignored prefix', () => {
        expect(JSON.stringify(getDynamicEnvironment({ path, ignorePrefixes: ['VAR_'] }))).toBe(
            JSON.stringify({
                CONST_ONE: 'const_one',
                CONST_TWO: 'const_two'
            })
        );
        expect(JSON.stringify(getDynamicEnvironment({ path, ignorePrefixes: ['CONST_'] }))).toBe(
            JSON.stringify({
                VAR_ONE: 'var_one',
                VAR_TWO: 'var_two'
            })
        );
    });
    test('everything ignored', () => {
        expect(
            JSON.stringify(
                getDynamicEnvironment({
                    path,
                    ignorePrefixes: ['VAR_', 'CONST_']
                })
            )
        ).toBe(JSON.stringify({}));
    });
});
