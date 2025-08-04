import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDynamicEnvironment } from '../getDynamicEnvironment';

const TEST_DIR = resolve(process.cwd(), 'temp-test-env');

describe('getDynamicEnvironment', () => {
    beforeAll(() => {
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
        mkdirSync(TEST_DIR, { recursive: true });
    });

    afterAll(() => {
        rmSync(TEST_DIR, { recursive: true, force: true });
    });

    it('should parse an env file and return the correct environment object', () => {
        const envContent = 'APP_URL=https://app.example.com\nAPI_KEY=12345';
        const envPath = resolve(TEST_DIR, '.env.test1');
        writeFileSync(envPath, envContent);

        const result = getDynamicEnvironment({ path: envPath });
        expect(result).toEqual({
            APP_URL: 'https://app.example.com',
            API_KEY: '12345'
        });
    });

    it('should filter out variables based on ignorePrefixes', () => {
        const envContent = 'VITE_STATIC_VAR=static\nAPP_DYNAMIC_VAR=dynamic\nPRIVATE_KEY=secret';
        const envPath = resolve(TEST_DIR, '.env.test2');
        writeFileSync(envPath, envContent);

        const result = getDynamicEnvironment({
            path: envPath,
            ignorePrefixes: ['VITE_', 'PRIVATE_']
        });

        expect(result).toEqual({
            APP_DYNAMIC_VAR: 'dynamic'
        });
    });

    it('should return an empty object if all variables are filtered', () => {
        const envContent = 'VITE_VAR1=a\nVITE_VAR2=b';
        const envPath = resolve(TEST_DIR, '.env.test3');
        writeFileSync(envPath, envContent);

        const result = getDynamicEnvironment({
            path: envPath,
            ignorePrefixes: ['VITE_']
        });

        expect(result).toEqual({});
    });

    it('should return an empty object for an empty env file', () => {
        const envPath = resolve(TEST_DIR, '.env.test4');
        writeFileSync(envPath, '');

        const result = getDynamicEnvironment({ path: envPath });
        expect(result).toEqual({});
    });

    it('should throw an error if the file does not exist', () => {
        const nonExistentPath = resolve(TEST_DIR, '.env.nonexistent');
        expect(() => getDynamicEnvironment({ path: nonExistentPath })).toThrow(
            `File does not exist (${nonExistentPath})`
        );
    });
});
