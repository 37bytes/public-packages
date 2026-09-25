export const mergeSettings = (loadSettings: () => Promise<{ theme: string }>): object => ({
    ...loadSettings(),
    locale: 'ru'
});
