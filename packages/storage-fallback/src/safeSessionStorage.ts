import { MemoryStorage } from './storage/MemoryStorage';
import isStorageSupported from './utils/isStorageSupported';

const safeSessionStorage: Storage = isStorageSupported('sessionStorage')
    ? globalThis.sessionStorage
    : new MemoryStorage();

export default safeSessionStorage;
