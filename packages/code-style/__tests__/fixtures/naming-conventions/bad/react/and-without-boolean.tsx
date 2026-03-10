import { useState } from 'react';

interface Item {
    name: string;
    count: number;
    items: string[];
}

const ItemList = () => {
    const items: Item[] = [
        { name: 'Apple', count: 5, items: ['a', 'b'] },
        { name: 'Banana', count: 0, items: [] }
    ];

    return (
        <div>
            {items.length && <span>Items found</span>}
            {items[0] && <span>Has first item</span>}
            {items[0].count && <span>First item count</span>}
            {items.map((item) => item.items.length && <div key={item.name}>{item.name}</div>)}
        </div>
    );
};

const UserProfile = () => {
    const user = { name: 'John', age: 25 };

    return (
        <div>
            {user.name.length && <h1>{user.name}</h1>}
            {user.age && <span>{user.age} years old</span>}
        </div>
    );
};

export { ItemList, UserProfile };
