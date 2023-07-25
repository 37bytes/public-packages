[![npm version](https://badge.fury.io/js/@37bytes%2Fstorage-fallback.svg)](https://badge.fury.io/js/@37bytes%2Fstorage-fallback) [![123](https://badgen.net/bundlephobia/minzip/@37bytes/storage-fallback)](https://bundlephobia.com/package/@37bytes/storage-fallback)

# @37bytes/storage-fallback
A library for working with storage (localStorage, sessionStorage) with automatic fallback to memory storage if the supported storages are unavailable in the current environment.

## Installation
You can install the package using npm:
```bash
npm install @37bytes/storage-fallback
```

## Usage

### Import Modules

```javascript
import { safeLocalStorage, safeSessionStorage, isStorageSupported } from '@37bytes/storage-fallback';
```

### isStorageSupported

Function `isStorageSupported` is used to determine the support for different types of storages (localStorage, sessionStorage) in the current environment.

## ESLint Recommendation

It is recommended to use the ESLint rule [no-storage/no-browser-storage](https://github.com/sahil290791/eslint-plugin-no-storage).
