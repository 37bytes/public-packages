import { describe, expect, test } from 'vitest';

import { SizeUnit } from '../src';

describe('SizeUnit', () => {
    test('kilobytes', () => {
        expect(SizeUnit.kilobytes(1)).toBe(1024);
        expect(SizeUnit.kilobytes(2)).toBe(2048);
        expect(SizeUnit.kilobytes(5)).toBe(5120);
    });
    test('megabytes', () => {
        expect(SizeUnit.megabytes(1)).toBe(1_048_576);
        expect(SizeUnit.megabytes(2)).toBe(2_097_152);
        expect(SizeUnit.megabytes(5)).toBe(5_242_880);
    });
    test('gigabytes', () => {
        expect(SizeUnit.gigabytes(1)).toBe(1_073_741_824);
        expect(SizeUnit.gigabytes(2)).toBe(2_147_483_648);
        expect(SizeUnit.gigabytes(5)).toBe(5_368_709_120);
    });
});
