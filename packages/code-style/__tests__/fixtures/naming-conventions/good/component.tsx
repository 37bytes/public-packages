import { type FunctionComponent, useState } from 'react';

interface UserProfile {
    userId: string;
    name: string;
    isActive: boolean;
}

interface UserCardProps {
    user: UserProfile;
    disabled?: boolean;
    loading?: boolean;
    adminAccess?: boolean;
    onClick(): void;
}

const UserCard: FunctionComponent<UserCardProps> = ({
    user,
    disabled: isDisabled = false,
    loading: isLoading = false,
    adminAccess: hasAdminAccess = false,
    onClick
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const save = () => {
        onClick();
    };

    return (
        <div className="user-card">
            <h2>{user.name}</h2>

            {isExpanded ? (
                <div className="user-details">
                    <p>ID: {user.userId}</p>
                    <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
            ) : null}

            <button type="button" onClick={toggleExpand}>
                {isExpanded ? 'Hide' : 'Show'}
            </button>

            <button type="button" disabled={isDisabled || isLoading} onClick={save}>
                {isLoading ? 'Saving...' : 'Save'}
            </button>

            {hasAdminAccess ? <div className="admin-panel" /> : null}
        </div>
    );
};

export { UserCard };
