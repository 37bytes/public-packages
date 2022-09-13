const TEST_KEY = `@37bytes/storage-fallback_test_key`;

type StorageType = 'localStorage' | 'sessionStorage' | 'memoryStorage';

const isStorageExists = (name: StorageType) => {
    try {
        const storage: any = window[name];
        storage.setItem(TEST_KEY, '1');
        storage.removeItem(TEST_KEY);
        return true;
    } catch (error) {
        return false;
    }
};

const isStorageSupported = (name: StorageType = 'localStorage') => {
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
