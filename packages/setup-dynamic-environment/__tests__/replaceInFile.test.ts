import { describe, expect, test } from '@jest/globals';
import replaceInFile from '../src/utils/replaceInFile';
import path from 'path';

const fs = require('fs');

const testFilePath = path.join(process.cwd(), '__tests__/testFile.txt');
const dynamicEnvironment = { key: 'value' };
const placeholder = '"__PLACE_FOR_DYNAMIC_ENVIRONMENT__"';

describe('replaceInFile', () => {
    test('should replace placeholder in the file content', () => {
        const originalContent = `This is a test file with ${placeholder} inside.`;

        fs.writeFileSync(testFilePath, originalContent, 'utf8');
        replaceInFile(testFilePath, dynamicEnvironment);
        fs.readFile(testFilePath, 'utf8', (error, data) => {
            const expectedContent = originalContent.replace(placeholder, JSON.stringify(dynamicEnvironment));
            expect(data).toBe(expectedContent);
            fs.unlink(testFilePath);
        });
    });
    test('should not replace anything if placeholder is absent', () => {
        const originalContent = `This is a test file without placeholder inside.`;

        fs.writeFileSync(testFilePath, originalContent, 'utf8');
        replaceInFile(testFilePath, dynamicEnvironment);
        fs.readFile(testFilePath, 'utf8', (error, data) => {
            const expectedContent = originalContent.replace(placeholder, JSON.stringify(dynamicEnvironment));
            expect(data).toBe(expectedContent);
            fs.unlink(testFilePath);
        });
    });
});
