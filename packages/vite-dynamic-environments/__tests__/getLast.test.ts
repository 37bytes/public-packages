import { describe, expect, test } from '@jest/globals';
import getLast from '../src/utils/getLast';

describe('get last element of array', () => {
    test('a full array', () => {
        const array1 = [1, 2, 3];
        const array2 = ['1', '2'];
        expect(getLast(array1)).toBe(3);
        expect(getLast(array2)).toBe('2');
    });
    test('an array of one', () => {
        const array = [1];
        expect(getLast(array)).toBe(1);
    });
    test('an array with elements of various types', () => {
        const array = ['1', { value: 2 }, 3];
        expect(getLast(array)).toBe(3);
    });
    test("returns 'undefined' for an empty array", () => {
        const array = [];
        expect(getLast(array)).toBe(undefined);
    });
});
