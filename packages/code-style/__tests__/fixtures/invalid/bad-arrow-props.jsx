/**
 * Invalid fixture - Arrow functions in props
 * This file should trigger @37bytes/no-arrow-props errors
 */

import { useState } from 'react';

const BadComponent = () => {
    const [value, setValue] = useState('');

    return (
        <div>
            {/* ERROR: Arrow function in onClick */}
            <button onClick={() => setValue('clicked')}>Click</button>

            {/* ERROR: Arrow function in onChange */}
            <input onChange={(e) => setValue(e.target.value)} value={value} />
        </div>
    );
};

export default BadComponent;
