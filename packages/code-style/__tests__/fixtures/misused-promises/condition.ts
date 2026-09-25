export const describeAccess = (checkAccess: () => Promise<boolean>): string => {
    if (checkAccess()) {
        return 'allowed';
    }
    return 'denied';
};
