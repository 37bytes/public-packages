class MemoryStorage implements Storage {
    private data: Record<string, string> = {};

    get length(): number {
        return Object.keys(this.data).length;
    }

    key(index: number): string | null {
        const keys = Object.keys(this.data);
        return keys[index] ?? null;
    }

    getItem(key: string): string | null {
        return Object.hasOwn(this.data, key) ? this.data[key]! : null;
    }

    setItem(key: string, value: string): void {
        this.data[key] = value;
    }

    removeItem(key: string): void {
        delete this.data[key];
    }

    clear(): void {
        this.data = {};
    }
}

export { MemoryStorage };
