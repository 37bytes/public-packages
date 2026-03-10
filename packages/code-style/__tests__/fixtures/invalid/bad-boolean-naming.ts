/**
 * Invalid fixture - Boolean naming violations
 * This file should trigger @37bytes/boolean-naming errors
 */

// ERROR: Boolean variable without prefix
const active = true;

// ERROR: Boolean variable without prefix
const loading = false;

// ERROR: Function returning boolean without prefix
const checkValid = (): boolean => true;

// ERROR: Destructuring boolean without renaming
interface Props {
    disabled: boolean;
    loading: boolean;
}

const Component = ({ disabled, loading }: Props) => {
    return null;
};

export { active, loading, checkValid, Component };
