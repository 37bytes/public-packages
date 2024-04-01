import { describe, expect, test } from '@jest/globals';
import { TimeUnit } from '../src';

describe('TimeUnit', () => {
    test('seconds', () => {
        expect(TimeUnit.seconds(1)).toBe(1000);
        expect(TimeUnit.seconds(2)).toBe(1000 * 2);
        expect(TimeUnit.seconds(5)).toBe(1000 * 5);
    });
    test('minutes', () => {
        expect(TimeUnit.minutes(1)).toBe(1000 * 60);
        expect(TimeUnit.minutes(2)).toBe(1000 * 60 * 2);
        expect(TimeUnit.minutes(5)).toBe(1000 * 60 * 5);
    });
    test('hours', () => {
        expect(TimeUnit.hours(1)).toBe(1000 * 60 * 60);
        expect(TimeUnit.hours(2)).toBe(1000 * 60 * 60 * 2);
        expect(TimeUnit.hours(5)).toBe(1000 * 60 * 60 * 5);
    });
    test('days', () => {
        expect(TimeUnit.days(1)).toBe(1000 * 60 * 60 * 24);
        expect(TimeUnit.days(2)).toBe(1000 * 60 * 60 * 24 * 2);
        expect(TimeUnit.days(5)).toBe(1000 * 60 * 60 * 24 * 5);
    });
    test('weeks', () => {
        expect(TimeUnit.weeks(1)).toBe(1000 * 60 * 60 * 24 * 7);
        expect(TimeUnit.weeks(2)).toBe(1000 * 60 * 60 * 24 * 7 * 2);
        expect(TimeUnit.weeks(5)).toBe(1000 * 60 * 60 * 24 * 7 * 5);
    });
});
