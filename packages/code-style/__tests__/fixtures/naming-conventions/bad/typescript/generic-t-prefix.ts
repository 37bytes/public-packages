function getItem<TItem>(id: string): TItem {
    return {} as TItem;
}

class DataStore<TData> {
    private items: TData[] = [];

    add(item: TData): void {
        this.items.push(item);
    }

    getAll(): TData[] {
        return this.items;
    }
}

type ApiClient<TResponse> = {
    fetch(): Promise<TResponse>;
    post(data: TResponse): Promise<void>;
};

export { getItem, DataStore };
export type { ApiClient };
