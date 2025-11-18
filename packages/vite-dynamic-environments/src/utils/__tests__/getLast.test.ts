import { describe, it, expect } from '@jest/globals';
import { getLast } from '../getLast';

describe('getLast', () => {
    it('should return the last element of a number array', () => {
        expect(getLast([1, 2, 3])).toBe(3);
    });

    it('should return the last element of a string array', () => {
        expect(getLast(['a', 'b', 'c'])).toBe('c');
    });

    it('should return the only element in a single-element array', () => {
        expect(getLast([100])).toBe(100);
    });

    it('should return undefined for an empty array', () => {
        expect(getLast([])).toBeUndefined();
    });

    it('should handle arrays with mixed types', () => {
        expect(getLast([1, 'a', { key: 'value' }, true])).toBe(true);
    });
});
