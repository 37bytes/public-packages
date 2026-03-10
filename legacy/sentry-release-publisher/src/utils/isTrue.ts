const isTrue = (value: unknown): value is true => value === true || value === 'true';

export default isTrue;
