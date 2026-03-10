import { MemoryStorage } from './storage/MemoryStorage';
import isStorageSupported from './utils/isStorageSupported';

const resolveStorage = (): Storage => {
    if (isStorageSupported('localStorage')) {
        return globalThis.localStorage;
    }

    if (isStorageSupported('sessionStorage')) {
        return globalThis.sessionStorage;
    }

    return new MemoryStorage();
};

const safeLocalStorage: Storage = resolveStorage();

export default safeLocalStorage;
