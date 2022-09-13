import isStorageSupported from './utils/isStorageSupported';
import memoryStorage from './storage/memoryStorage';

let safeLocalStorage: Storage;

if (isStorageSupported('localStorage')) {
    safeLocalStorage = window.localStorage;
} else if (isStorageSupported('sessionStorage')) {
    safeLocalStorage = window.sessionStorage;
} else {
    safeLocalStorage = new memoryStorage();
}

export default safeLocalStorage;
