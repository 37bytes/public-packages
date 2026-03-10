const active = true;
const loading = false;
const disabled = true;
const visible = false;
const valid = true;
const pending = false;

function checkStatus(): boolean {
    return active && valid;
}

interface User {
    active: boolean;
    loading: boolean;
    disabled: boolean;
}

const UserComponent = ({ active, loading, disabled }: User) => {
    return null;
};

export { active, loading, disabled, visible, valid, pending, checkStatus, UserComponent };
