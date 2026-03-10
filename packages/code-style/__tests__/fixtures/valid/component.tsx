/**
 * Valid fixture - React component following all conventions
 */

import { useState } from 'react';

interface UserCardProps {
    name: string;
    isActive: boolean;
    hasAdminAccess: boolean;
    onUpdate: () => void;
}

const UserCard = ({ name, isActive, hasAdminAccess, onUpdate }: UserCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="user-card">
            <h2>{name}</h2>
            {isExpanded ? (
                <div className="details">
                    <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
                </div>
            ) : null}
            <button type="button" onClick={handleToggleExpand}>
                {isExpanded ? 'Hide' : 'Show'}
            </button>
            {hasAdminAccess ? (
                <button type="button" onClick={onUpdate}>
                    Update
                </button>
            ) : null}
        </div>
    );
};

export default UserCard;
