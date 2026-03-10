type UserId = string | number;

interface User {
    id: UserId;
    name: string;
    email: string;
}

const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 1000;
const API_BASE_URL = 'https://api.example.com';

const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
};

const defaultConfig = {
    timeout: DEFAULT_TIMEOUT,
    retries: MAX_RETRIES,
    headers: defaultHeaders
};

const sleep = async (delayMs: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, delayMs);
    });

const fetchWithRetry = async <T>(fetcher: () => Promise<T>, retriesLeft: number = MAX_RETRIES): Promise<T> => {
    try {
        return await fetcher();
    } catch (error) {
        if (retriesLeft <= 1) {
            throw error instanceof Error ? error : new Error(String(error));
        }
        await sleep(DEFAULT_TIMEOUT * (MAX_RETRIES - retriesLeft + 1));
        return fetchWithRetry(fetcher, retriesLeft - 1);
    }
};

const fetchUser = async (id: UserId): Promise<User | null> => {
    const response = await fetchWithRetry(async () => {
        const result = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'GET',
            headers: defaultHeaders
        });

        if (!result.ok) {
            if (result.status === 404) {
                return null;
            }
            throw new Error(`HTTP error: ${result.status}`);
        }

        return result.json();
    });

    if (!response) {
        return null;
    }

    const { user_id: userId, user_name: userName, is_active: isActive } = response;

    return {
        id: userId,
        name: userName,
        email: isActive ? 'active@example.com' : 'inactive@example.com'
    };
};

const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
    }

    return response.json();
};

export { fetchUser, createUser, defaultConfig, MAX_RETRIES };
