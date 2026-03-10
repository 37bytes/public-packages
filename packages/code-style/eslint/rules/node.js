/**
 * @fileoverview Node.js environment ESLint rules (eslint-plugin-n)
 * @author 37bytes
 *
 * Three exports:
 * - node: common ESM/Node.js rules for all files
 * - nodeCjs: CJS-specific rules for .cjs files only
 * - nodeStrict: strict rules for server code (opt-in)
 *
 * Severity levels:
 * - warn: Desirable, should be followed in most cases
 * - error: Critical, must be followed (enforced strictly)
 */

/**
 * Общие правила Node.js для ESM-проектов (23 правила).
 *
 * Входит в `nodeConfig` и `recommendedNode`.
 * Покрывает: deprecated API, phantom-зависимости, совместимость с версией Node,
 * node:-протокол, promises вместо callback, явные импорты вместо глобалов.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const node = {
    // === Module Safety ===
    'n/no-deprecated-api': 'error',
    // n/no-extraneous-import — removed: duplicates import-x/no-extraneous-dependencies + TS resolution
    // n/no-unpublished-import — removed: duplicates TS resolution + bundler errors
    'n/no-unpublished-bin': 'error',
    'n/hashbang': 'error',

    // === Process ===
    'n/no-process-exit': 'warn',
    'n/process-exit-as-throw': 'error',
    'n/no-process-env': 'warn',

    // === Compatibility ===
    'n/no-unsupported-features/es-builtins': 'error',
    'n/no-unsupported-features/es-syntax': 'error',
    'n/no-unsupported-features/node-builtins': 'error',

    // === Modern Style ===
    'n/prefer-node-protocol': 'error',
    'n/prefer-promises/dns': 'error',
    'n/prefer-promises/fs': 'error',

    // === Prefer Global ===
    // "never" = always use explicit import, not global
    'n/prefer-global/buffer': ['error', 'never'],
    'n/prefer-global/process': ['error', 'never'],
    'n/prefer-global/text-decoder': ['error', 'never'],
    'n/prefer-global/text-encoder': ['error', 'never'],
    'n/prefer-global/url': ['error', 'never'],
    'n/prefer-global/url-search-params': ['error', 'never'],
    'n/prefer-global/timers': ['error', 'never'],
    'n/prefer-global/crypto': ['error', 'never'],
    // "always" = use global console (importing from node:console is exotic)
    'n/prefer-global/console': ['error', 'always'],

    // === Security (eslint-plugin-security) ===
    'security/detect-non-literal-fs-filename': 'warn',

    // === Disabled ===
    'n/no-missing-import': 'off', // TypeScript handles import resolution
    'n/no-top-level-await': 'off', // normal ESM feature
    'n/file-extension-in-import': 'off' // bundlers/TS catch this at build time
};

/**
 * Правила для CommonJS-файлов (10 правил).
 *
 * Входит в `nodeCjsConfig` и `recommendedNode` (files: `**\/*.cjs`).
 * Покрывает: стиль module.exports, размещение require(), проверка зависимостей, безопасность путей.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const nodeCjs = {
    // === CJS Module ===
    'n/exports-style': ['warn', 'module.exports'],
    'n/global-require': 'error',
    'n/no-mixed-requires': 'error',
    'n/no-new-require': 'error',
    'n/no-exports-assign': 'error',

    // === CJS Dependencies ===
    'n/no-extraneous-require': 'error',
    'n/no-missing-require': 'error',
    'n/no-unpublished-require': 'error',

    // === CJS Safety ===
    'n/callback-return': 'warn',
    'n/no-path-concat': 'error'
};

/**
 * Строгие правила для серверного кода — opt-in, НЕ входит ни в один пресет (1 правило).
 *
 * Запрещает синхронный I/O (`readFileSync`, `execSync` и т.д.),
 * блокирующий event loop. Безопасно в CLI/скриптах, опасно на сервере.
 *
 * Подключение: spread в кастомный конфиг с нужным `files`-паттерном:
 * ```js
 * { files: ['src/server/**'], rules: { ...nodeStrict } }
 * ```
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const nodeStrict = {
    'n/no-sync': 'error'
};
