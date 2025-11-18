import { describe, it, expect } from '@jest/globals';
import { generateScript } from '../generateScript';

describe('generateScript', () => {
    it('should generate a valid script string for a simple object', () => {
        const environment = {
            API_URL: 'https://api.example.com',
            FEATURE_FLAG: true
        };
        const expectedScript = `window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});`;
        expect(generateScript(environment)).toBe(expectedScript);
    });

    it('should handle an empty object', () => {
        const environment = {};
        const expectedScript = 'window.dynamicEnvironment = Object.freeze({});';
        expect(generateScript(environment)).toBe(expectedScript);
    });

    it('should handle an object with various data types', () => {
        const environment = {
            APP_NAME: 'My App',
            VERSION: 1.2,
            IS_PRODUCTION: false,
            NULL_VALUE: null
        };
        const expectedScript = `window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});`;
        expect(generateScript(environment)).toBe(expectedScript);
    });

    it('should correctly serialize nested objects', () => {
        const environment = {
            config: {
                host: 'localhost',
                port: 3000
            }
        };
        const expectedScript = `window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});`;
        expect(generateScript(environment)).toBe(expectedScript);
    });
});
