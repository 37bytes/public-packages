interface ButtonProps {
    label: string;
    onClick(): void;
    isDisabled?: boolean;
    isLoading?: boolean;
    hasAdminAccess?: boolean;
}

const Button = ({ label, onClick, isDisabled, isLoading, hasAdminAccess }: ButtonProps) => {
    return (
        <button onClick={onClick} disabled={isDisabled || isLoading}>
            {isLoading ? 'Loading...' : label}
        </button>
    );
};

interface CardProps {
    title: string;
    isExpanded?: boolean;
    isVisible?: boolean;
}

const Card = ({ title, isExpanded, isVisible }: CardProps) => {
    return (
        <div>
            <h2>{title}</h2>
            {isExpanded && <div>Expanded content</div>}
            {isVisible && <span>Visible</span>}
        </div>
    );
};

export { Button, Card };
