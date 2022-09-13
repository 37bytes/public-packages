class MemoryStorage extends Storage {
    private data: Record<string, string>;

    constructor() {
        super();
        this.data = {};
    }

    getItem(key) {
        return this.data.hasOwnProperty(key) ? this.data[key] : null;
    }

    setItem(key, value) {
        this.data[key] = value;
    }

    removeItem(key) {
        delete this.data[key];
    }

    clear() {
        this.data = {};
    }
}

export default MemoryStorage;
