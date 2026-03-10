/**
 * Valid fixture - TypeScript utilities following all conventions
 */

const MAX_RETRIES = 3;

interface UserData {
    userId: string;
    name: string;
    isActive: boolean;
}

type UserId = string | number;

enum RequestStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

const isValidUser = (user: UserData): boolean => {
    return user.isActive && user.name.length > 0;
};

const hasPermission = (userId: UserId, permission: string): boolean => {
    return typeof userId === 'string' && permission.length > 0;
};

const getUserData = (id: UserId): UserData | null => {
    if (!id) {
        return null;
    }
    return {
        userId: String(id),
        name: 'Test User',
        isActive: true
    };
};

export { MAX_RETRIES, isValidUser, hasPermission, getUserData, RequestStatus };
export type { UserData, UserId };
