import { useState } from 'react';

interface ButtonProps {
    label: string;
    onClick(): void;
    disabled?: boolean;
}

function Button({ label, onClick, disabled }: ButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        onClick();
    };

    return (
        <button onClick={handleClick} disabled={disabled || isLoading}>
            {isLoading ? 'Loading...' : label}
        </button>
    );
}

function UserCard(props: { name: string; age: number }) {
    return (
        <div>
            <h2>{props.name}</h2>
            <p>{props.age}</p>
        </div>
    );
}

export { Button, UserCard };
