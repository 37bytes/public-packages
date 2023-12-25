import SmartURLSearchParams from '../SmartURLSearchParams';
import { describe, expect, test } from '@jest/globals';

describe('SmartURLSearchParams', () => {
    test('should initialize with object parameters', () => {
        const params = new SmartURLSearchParams({ name: 'Alice', age: 30 });
        expect(params.get('name')).toBe('Alice');
        expect(params.get('age')).toBe('30');
    });

    test('should handle array values', () => {
        const params = new SmartURLSearchParams({ colors: ['red', 'green', 'blue'] });
        expect(params.getAll('colors')).toEqual(['red', 'green', 'blue']);
    });

    test('should ignore null and undefined values', () => {
        const params = new SmartURLSearchParams({ a: null, b: undefined, c: 'valid' });
        expect(params.get('a')).toBeNull();
        expect(params.get('b')).toBeNull();
        expect(params.get('c')).toBe('valid');
    });

    describe('toFormattedString', () => {
        const testParams = { name: 'Alice', numbers: [1, 2, 3] };

        test('should handle default array format', () => {
            const params = new SmartURLSearchParams(testParams);
            expect(params.toFormattedString()).toBe('name=Alice&numbers=1&numbers=2&numbers=3');
        });

        test('should handle bracket array format', () => {
            const params = new SmartURLSearchParams(testParams);
            expect(params.toFormattedString({ arrayFormat: 'bracket' })).toBe(
                'name=Alice&numbers[]=1&numbers[]=2&numbers[]=3'
            );
        });

        test('should handle index array format', () => {
            const params = new SmartURLSearchParams(testParams);
            expect(params.toFormattedString({ arrayFormat: 'index' })).toBe(
                'name=Alice&numbers[0]=1&numbers[1]=2&numbers[2]=3'
            );
        });

        test('should handle comma array format', () => {
            const params = new SmartURLSearchParams(testParams);
            expect(params.toFormattedString({ arrayFormat: 'comma' })).toBe('name=Alice&numbers=1,2,3');
        });

        test('should handle separator array format', () => {
            const params = new SmartURLSearchParams(testParams);
            expect(params.toFormattedString({ arrayFormat: 'separator', arrayFormatSeparator: '|' })).toBe(
                'name=Alice&numbers=1|2|3'
            );
        });

        test('should handle bracket-separator array format', () => {
            const params = new SmartURLSearchParams({ items: ['one', 'two', 'three'] });
            expect(params.toFormattedString({ arrayFormat: 'bracket-separator', arrayFormatSeparator: '|' })).toBe(
                'items[]=one|two|three'
            );
        });
    });

    describe('SmartURLSearchParams with forceArrayFields', () => {
        test('should format single values as arrays when specified in forceArrayFields', () => {
            const params = new SmartURLSearchParams({ item: 'value' });
            const formattedString = params.toFormattedString({
                arrayFormat: 'bracket',
                forceArrayFields: ['item']
            });
            expect(formattedString).toBe('item[]=value');
        });

        test('should handle multiple values and forced array fields correctly', () => {
            const params = new SmartURLSearchParams({ item: 'value', numbers: [1, 2] });
            const formattedString = params.toFormattedString({
                arrayFormat: 'index',
                forceArrayFields: ['item']
            });
            expect(formattedString).toBe('item[0]=value&numbers[0]=1&numbers[1]=2');
        });
    });

    describe('SmartURLSearchParams Edge Cases', () => {
        test('should handle empty strings correctly', () => {
            const params = new SmartURLSearchParams({ empty: '' });
            expect(params.get('empty')).toBe('');
        });

        test('should handle strings with special characters correctly', () => {
            const specialCharString = '!@#$%^&*()';
            const params = new SmartURLSearchParams({ special: specialCharString });
            expect(params.get('special')).toBe(specialCharString);
        });

        test('should handle very long strings correctly', () => {
            const longString = 'a'.repeat(1000);
            const params = new SmartURLSearchParams({ long: longString });
            expect(params.get('long')).toBe(longString);
        });

        test('should handle arrays with a single element correctly', () => {
            const params = new SmartURLSearchParams({ singleItemArray: ['one'] });
            expect(params.getAll('singleItemArray')).toEqual(['one']);
        });

        test('should handle empty arrays correctly', () => {
            const params = new SmartURLSearchParams({ emptyArray: [] });
            expect(params.getAll('emptyArray')).toEqual([]);
        });

        test('should handle arrays with special characters correctly', () => {
            const specialArray = ['!@#', '$%^', '&*()'];
            const params = new SmartURLSearchParams({ specialArray });
            expect(params.getAll('specialArray')).toEqual(specialArray);
        });

        test('should handle very long arrays correctly', () => {
            const longArray = new Array(100).fill('a');
            const params = new SmartURLSearchParams({ longArray });
            expect(params.getAll('longArray')).toEqual(longArray);
        });
    });

    describe('SmartURLSearchParams Liskov Substitution Principle Compliance', () => {
        test('should support basic URLSearchParams functionality', () => {
            const params = new SmartURLSearchParams({ key: 'value', anotherKey: 'anotherValue' });
            expect(params.get('key')).toBe('value');
            expect(params.toString()).toBe('key=value&anotherKey=anotherValue');
        });

        test('should support appending new parameters', () => {
            const params = new SmartURLSearchParams();
            params.append('newKey', 'newValue');
            expect(params.get('newKey')).toBe('newValue');
        });

        test('should support deleting parameters', () => {
            const params = new SmartURLSearchParams({ key: 'value', anotherKey: 'anotherValue' });
            params.delete('key');
            expect(params.get('key')).toBeNull();
            expect(params.has('anotherKey')).toBeTruthy();
        });

        test('should support iterating over parameters', () => {
            const params = new SmartURLSearchParams({ key: 'value', anotherKey: 'anotherValue' });
            const keys = [];
            const values = [];
            for (const [key, value] of params) {
                keys.push(key);
                values.push(value);
            }
            expect(keys).toEqual(['key', 'anotherKey']);
            expect(values).toEqual(['value', 'anotherValue']);
        });

        test('should support all URLSearchParams methods', () => {
            const params = new SmartURLSearchParams({ key: 'value', anotherKey: 'anotherValue' });
            expect(typeof params.append).toBe('function');
            expect(typeof params.delete).toBe('function');
            expect(typeof params.get).toBe('function');
            expect(typeof params.getAll).toBe('function');
            expect(typeof params.has).toBe('function');
            expect(typeof params.set).toBe('function');
            expect(typeof params.toString).toBe('function');
        });
    });

    describe('SmartURLSearchParams toString Method', () => {
        test('should produce the same output as URLSearchParams toString for basic usage', () => {
            const nativeParams = new URLSearchParams({ key: 'value', anotherKey: 'anotherValue' });
            const smartParams = new SmartURLSearchParams({ key: 'value', anotherKey: 'anotherValue' });

            expect(smartParams.toString()).toBe(nativeParams.toString());
        });

        test('should correctly handle arrays when using default URLSearchParams behavior', () => {
            const smartParams = new SmartURLSearchParams({ items: ['one', 'two', 'three'] });
            expect(smartParams.toString()).toBe('items=one&items=two&items=three');
        });

        test('should correctly handle empty and special characters', () => {
            const smartParams = new SmartURLSearchParams({ empty: '', special: '!@#$%^&*()' });
            expect(smartParams.toString()).toBe('empty=&special=%21%40%23%24%25%5E%26*%28%29');
        });
    });
});
