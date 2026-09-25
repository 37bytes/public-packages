export const subscribe = (refresh: () => Promise<void>): void => {
    document.addEventListener('visibilitychange', async () => {
        await refresh();
    });
};
