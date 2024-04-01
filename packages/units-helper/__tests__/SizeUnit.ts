import { describe, expect, test } from '@jest/globals';
import { SizeUnit } from '../src';

describe('SizeUnit', () => {
    test('kilobytes', () => {
        expect(SizeUnit.kilobytes(1)).toBe(1024);
        expect(SizeUnit.kilobytes(2)).toBe(2048);
        expect(SizeUnit.kilobytes(5)).toBe(5120);
    });
    test('megabytes', () => {
        expect(SizeUnit.megabytes(1)).toBe(1048576);
        expect(SizeUnit.megabytes(2)).toBe(2097152);
        expect(SizeUnit.megabytes(5)).toBe(5242880);
    });
    test('gigabytes', () => {
        expect(SizeUnit.gigabytes(1)).toBe(1073741824);
        expect(SizeUnit.gigabytes(2)).toBe(2147483648);
        expect(SizeUnit.gigabytes(5)).toBe(5368709120);
    });
});
