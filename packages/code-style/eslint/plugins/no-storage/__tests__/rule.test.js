/**
 * @fileoverview Tests for no-browser-storage rule
 */

import { rule } from '#eslint/plugins/no-storage/rule';

import { test } from 'node:test';

import { RuleTester } from 'eslint';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
});

// --- Valid code ---

test('no-browser-storage: valid code', () => {
    tester.run('no-browser-storage', rule, {
        valid: [
            'const x = 1',
            'const storage = { getItem: () => {} }',
            'myStorage.getItem("key")',
            'customLocalStorage.setItem("key", "value")',
            'const localStorageWrapper = {}',
            'function getFromSessionStorage() {}',
            // Property of non-global objects
            'app.localStorage',
            'config.sessionStorage',
            'this.localStorage',
            // String literals
            'const name = "localStorage"',
            // Object property keys (not references)
            '({ localStorage: "mock" })',
            'const obj = { sessionStorage: null }',
            // Computed property with string
            '({ ["localStorage"]: "mock" })'
        ],
        invalid: []
    });
});

// --- localStorage ---

test('no-browser-storage: localStorage method calls', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'localStorage.getItem("key")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'localStorage.setItem("key", "value")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'localStorage.removeItem("key")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'localStorage.clear()',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'localStorage.length',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'localStorage["getItem"]("key")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            }
        ]
    });
});

// --- sessionStorage ---

test('no-browser-storage: sessionStorage method calls', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'sessionStorage.getItem("key")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'sessionStorage.setItem("key", "value")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            },
            {
                code: 'sessionStorage.removeItem("key")',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 1 }]
            }
        ]
    });
});

// --- Direct references ---

test('no-browser-storage: direct references', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'const storage = localStorage',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 17 }]
            },
            {
                code: 'console.log(sessionStorage)',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 13 }]
            },
            {
                code: 'saveData(localStorage)',
                errors: [{ messageId: 'noBrowserStorage', line: 1, column: 10 }]
            }
        ]
    });
});

// --- Optional chaining ---

test('no-browser-storage: optional chaining', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'localStorage?.getItem("key")',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'sessionStorage?.setItem("key", "value")',
                errors: [{ messageId: 'noBrowserStorage' }]
            }
        ]
    });
});

// --- Destructuring ---

test('no-browser-storage: destructuring from storage', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'const { getItem } = localStorage',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'const { setItem, removeItem } = sessionStorage',
                errors: [{ messageId: 'noBrowserStorage' }]
            }
        ]
    });
});

// --- window/globalThis/self prefix ---

test('no-browser-storage: window/globalThis/self prefix', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'window.localStorage.getItem("key")',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'window.sessionStorage.setItem("key", "val")',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'globalThis.localStorage.getItem("key")',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'self.localStorage.clear()',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'self.sessionStorage.removeItem("key")',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            // Standalone reference with prefix (no further property access)
            {
                code: 'window.localStorage',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            {
                code: 'globalThis.sessionStorage',
                errors: [{ messageId: 'noBrowserStorage' }]
            },
            // Passed as argument
            {
                code: 'saveData(window.localStorage)',
                errors: [{ messageId: 'noBrowserStorage' }]
            }
        ]
    });
});

// --- typeof ---

test('no-browser-storage: typeof check', () => {
    tester.run('no-browser-storage', rule, {
        valid: [],
        invalid: [
            {
                code: 'typeof localStorage',
                errors: [{ messageId: 'noBrowserStorage' }]
            }
        ]
    });
});
