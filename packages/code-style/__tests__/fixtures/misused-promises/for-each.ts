export const saveAll = (items: string[], save: (item: string) => Promise<void>): void => {
    items.forEach(async (item) => {
        await save(item);
    });
};
