/**
 * Invalid fixture - Browser storage usage
 * This file should trigger @37bytes/no-browser-storage errors
 */

// ERROR: localStorage usage
const savedData = localStorage.getItem('key');

// ERROR: sessionStorage usage
sessionStorage.setItem('key', 'value');

// ERROR: Direct reference to localStorage
const storage = localStorage;

export { savedData, storage };
