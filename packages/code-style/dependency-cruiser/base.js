/**
 * @fileoverview Base-пресет dependency-cruiser: гигиена графа зависимостей.
 * Полный init-набор: 7 shipped-правил (recommended-strict) + 4 проектных расширения.
 * Решение Д. 2026-06-07. Не привязан к FSD.
 *
 * @example
 * // .dependency-cruiser.mjs
 * import { createBaseCruiserConfig } from '@37bytes/code-style/dependency-cruiser';
 * export default createBaseCruiserConfig();
 */

import { buildCruiserOptions } from './options.js';

const buildBaseRules = () => [
    {
        name: 'no-circular',
        comment: 'Циклические зависимости запрещены (severity повышена до error относительно init-шаблона)',
        severity: 'error',
        from: {},
        to: { circular: true }
    },
    {
        name: 'no-orphans',
        comment: 'Модули, на которые никто не ссылается и которые ни на что не ссылаются',
        severity: 'warn',
        from: {
            orphan: true,
            pathNot:
                '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$|\\.d\\.(c|m)?ts$|(^|/)tsconfig\\.json$|(^|/)(?:babel|webpack)\\.config\\.(?:js|cjs|mjs|ts|json)$'
        },
        to: {}
    },
    {
        name: 'no-deprecated-core',
        comment: 'Deprecated core-модули Node',
        severity: 'error',
        from: {},
        to: {
            dependencyTypes: ['core'],
            path: '^(?:punycode|domain|constants|sys|_linklist|_stream_wrap)$'
        }
    },
    {
        name: 'not-to-deprecated',
        comment: 'Зависимость на npm-пакет, помеченный deprecated',
        severity: 'warn',
        from: {},
        to: { dependencyTypes: ['deprecated'] }
    },
    {
        name: 'no-non-package-json',
        comment: 'npm-зависимость, отсутствующая в package.json',
        severity: 'error',
        from: {},
        to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] }
    },
    {
        name: 'not-to-unresolvable',
        comment: 'Импорт, который не резолвится на диске',
        severity: 'error',
        from: {},
        to: { couldNotResolve: true }
    },
    {
        name: 'no-duplicate-dep-types',
        comment: 'Один пакет в нескольких секциях package.json',
        severity: 'warn',
        from: {},
        to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] }
    },
    {
        name: 'not-to-test',
        comment: 'Продуктовый код не зависит от тестового',
        severity: 'error',
        from: { pathNot: ['\\.(test|spec)\\.(js|mjs|cjs|ts|tsx)$', '(^|/)__tests__/', '(^|/)testing/'] },
        to: { path: ['\\.(test|spec)\\.(js|mjs|cjs|ts|tsx)$', '(^|/)__tests__/', '(^|/)testing/'] }
    },
    {
        name: 'not-to-dev-dep',
        comment: 'Продуктовый код не импортирует devDependencies',
        severity: 'error',
        from: {
            path: '^src/',
            pathNot: [
                '\\.(test|spec)\\.(js|mjs|cjs|ts|tsx)$',
                '(^|/)__tests__/',
                '(^|/)testing/',
                '\\.stories\\.(ts|tsx)$'
            ]
        },
        to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'], pathNot: ['node_modules/@types/'] }
    },
    {
        name: 'optional-deps-used',
        comment: 'Использование optionalDependency: убедиться, что есть обработка отсутствия',
        severity: 'info',
        from: {},
        to: { dependencyTypes: ['npm-optional'] }
    },
    {
        name: 'peer-deps-used',
        comment: 'Использование peerDependency: осознанно ли',
        severity: 'warn',
        from: {},
        to: { dependencyTypes: ['npm-peer'] }
    }
];

/**
 * @param {object} [options]
 * @param {string} [options.tsConfigFileName] см. buildCruiserOptions
 * @returns {object} полная конфигурация dependency-cruiser
 */
export const createBaseCruiserConfig = (options = {}) => {
    const { tsConfigFileName } = options;

    return {
        forbidden: buildBaseRules(),
        options: buildCruiserOptions({ tsConfigFileName })
    };
};

export { buildBaseRules };
