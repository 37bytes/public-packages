const TEST_KEY = '@37bytes/storage-fallback_test_key';

type BrowserStorageType = 'localStorage' | 'sessionStorage';
type StorageType = BrowserStorageType | 'memoryStorage';

const isStorageExists = (name: BrowserStorageType): boolean => {
    try {
        const storage: Storage = globalThis[name];
        storage.setItem(TEST_KEY, '1');
        storage.removeItem(TEST_KEY);
        return true;
    } catch {
        return false;
    }
};

const isStorageSupported = (name: StorageType = 'localStorage'): boolean => {
    switch (name) {
        case 'localStorage':
            return isStorageExists('localStorage');
        case 'sessionStorage':
            return isStorageExists('sessionStorage');
        case 'memoryStorage':
            return true;
        default:
            return false;
    }
};

export default isStorageSupported;
