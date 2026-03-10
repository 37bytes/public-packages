import { useState, useCallback } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    shouldRefreshToken: boolean;
    canAccessAdmin: boolean;
    didLoadInitialData: boolean;
}

const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        shouldRefreshToken: false,
        canAccessAdmin: false,
        didLoadInitialData: false
    });

    const handleLogin = useCallback((user: User) => {
        setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user,
            didLoadInitialData: true
        }));
    }, []);

    const handleLogout = useCallback(() => {
        setState({
            isAuthenticated: false,
            user: null,
            shouldRefreshToken: false,
            canAccessAdmin: false,
            didLoadInitialData: false
        });
    }, []);

    const checkPermissions = useCallback(
        (requiredRole: string): boolean => {
            if (!state.user) {
                return false;
            }
            return state.user.role === requiredRole;
        },
        [state.user]
    );

    return {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        shouldRefreshToken: state.shouldRefreshToken,
        canAccessAdmin: state.canAccessAdmin,
        didLoadInitialData: state.didLoadInitialData,
        login: handleLogin,
        logout: handleLogout,
        checkPermissions
    };
};

export { useAuth };
