import { type ReactNode, useState } from 'react';

// ─── JavaScript: proper patterns ────────────────────────────────────────────

/**
 * Status constants using `as const` (no enums)
 */
const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];

// prefer-template: using template literals instead of concatenation
const formatLabel = (prefix: string, name: string) => `${prefix}: ${name}`;

// object-shorthand: using shorthand method/property syntax
const createUser = (name: string, age: number) => ({ name, age });

// no-nested-ternary: using if/else instead of nested ternary
const getStatusLabel = (status: Status) => {
    if (status === STATUS.ACTIVE) {
        return 'Active';
    }
    return 'Inactive';
};

// ─── TypeScript: proper patterns ────────────────────────────────────────────

// consistent-type-imports: type-only import is inline (see top import)
// no-explicit-any: using proper types instead of `any`
interface DataResult {
    value: string;
    count: number;
}

const processData = (result: DataResult): string => result.value;

// ─── React: proper patterns ────────────────────────────────────────────────

interface StatusBadgeProps {
    status: Status;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const label = getStatusLabel(status);

    return <span className="badge">{label}</span>;
};

/**
 * Props follow HTML-style boolean naming (no `is` prefix).
 * Event handlers use `on*` prefix.
 */
interface UserCardProps {
    name: string;
    disabled?: boolean;
    loading?: boolean;
    children?: ReactNode;
    onChange?(value: string): void;
}

/**
 * Arrow function component (never function declarations).
 */
const UserCard = ({ name, disabled, loading, children, onChange }: UserCardProps) => {
    const [value, setValue] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        onChange?.(newValue);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="user-card">
            <h2>{name}</h2>
            <StatusBadge status={STATUS.ACTIVE} />
            <input disabled={disabled} type="text" value={value} onChange={handleChange} />
            {children != null ? <div className="content">{children}</div> : null}
        </div>
    );
};

// ─── Regexp: proper patterns ────────────────────────────────────────────────

// regexp/prefer-d: using \d instead of [0-9]
const DIGIT_PATTERN = /^\d+$/;

// regexp/no-useless-escape: no unnecessary escapes
const WORD_PATTERN = /^[a-z]+$/i;

// Using the patterns to avoid unused variable warnings
const isDigits = (value: string) => DIGIT_PATTERN.test(value);
const isWord = (value: string) => WORD_PATTERN.test(value);

// ─── Quality: proper patterns ───────────────────────────────────────────────

// sonarjs/no-collapsible-if: using combined conditions
const checkAccess = (role: string, isActive: boolean) => role === 'admin' && isActive;

// sonarjs/prefer-single-boolean-return: direct return
const validateLength = (value: string) => value.length > 0;

// ─── Exports ────────────────────────────────────────────────────────────────

export { UserCard, formatLabel, createUser, processData, isDigits, isWord, checkAccess, validateLength };
export type { UserCardProps };
