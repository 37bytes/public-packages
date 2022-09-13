import isStorageSupported from './utils/isStorageSupported';
import memoryStorage from './storage/memoryStorage';

let safeSessionStorage: Storage;

if (isStorageSupported('sessionStorage')) {
    safeSessionStorage = window.sessionStorage;
} else {
    safeSessionStorage = new memoryStorage();
}

export default safeSessionStorage;
