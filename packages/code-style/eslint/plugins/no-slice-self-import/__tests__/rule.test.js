/**
 * @fileoverview Tests for no-slice-self-import rule
 */

import { rule } from '#eslint/plugins/no-slice-self-import/rule';

import { test } from 'node:test';

import { RuleTester } from 'eslint';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    }
});

test('no-slice-self-import: разрешённые импорты', async (ctx) => {
    await ctx.test('относительные импорты внутри слайса — ок', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [
                {
                    code: "import { User } from '../model/types';",
                    filename: '/project/src/entities/user/api/getUser.ts'
                },
                {
                    code: "import { UserCard } from './UserCard';",
                    filename: '/project/src/entities/user/ui/index.ts'
                }
            ],
            invalid: []
        });
    });

    await ctx.test('импорт чужого слайса через @/ — ок', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [
                {
                    code: "import { Product } from '@/entities/product';",
                    filename: '/project/src/entities/user/api/getUser.ts'
                },
                {
                    code: "import { Button } from '@/shared/ui';",
                    filename: '/project/src/entities/user/ui/UserCard.tsx'
                },
                {
                    code: "import { useAuth } from '@/features/auth';",
                    filename: '/project/src/pages/homePage/ui/HomePage.tsx'
                }
            ],
            invalid: []
        });
    });

    await ctx.test('barrel-файлы могут импортировать свой слайс', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [
                {
                    code: "export { User } from './model/types';",
                    filename: '/project/src/entities/user/index.ts'
                },
                {
                    code: "export { getUser } from './api/getUser';",
                    filename: '/project/src/entities/user/server.ts'
                },
                {
                    code: "export { UserCard } from './ui/UserCard';",
                    filename: '/project/src/entities/user/client.ts'
                }
            ],
            invalid: []
        });
    });

    await ctx.test('файл вне слайса — правило не применяется', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [
                {
                    code: "import { User } from '@/entities/user';",
                    filename: '/project/src/app/providers/AppProvider.tsx'
                },
                {
                    code: "import { theme } from '@/shared/config';",
                    filename: '/project/eslint.config.mjs'
                }
            ],
            invalid: []
        });
    });
});

test('no-slice-self-import: запрещённые импорты', async (ctx) => {
    await ctx.test('импорт своего слайса через @/ — entities', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { User } from '@/entities/user';",
                    filename: '/project/src/entities/user/api/getUser.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                },
                {
                    code: "import { User } from '@/entities/user/server';",
                    filename: '/project/src/entities/user/api/getUser.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                },
                {
                    code: "import { UserCard } from '@/entities/user/client';",
                    filename: '/project/src/entities/user/model/store.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                }
            ]
        });
    });

    await ctx.test('импорт своего слайса — features', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { SearchInput } from '@/features/searchArticles';",
                    filename: '/project/src/features/searchArticles/ui/SearchBlock.tsx',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                }
            ]
        });
    });

    await ctx.test('импорт своего слайса — pages', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { ArticlePage } from '@/pages/articlePage';",
                    filename: '/project/src/pages/articlePage/ui/components/TitleBlock.tsx',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                }
            ]
        });
    });

    await ctx.test('импорт своего слайса — widgets', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { ForumLayout } from '@/widgets/forumLayout';",
                    filename: '/project/src/widgets/forumLayout/ui/header/Header.tsx',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                }
            ]
        });
    });

    await ctx.test('export from своего слайса — тоже запрещено', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [],
            invalid: [
                {
                    code: "export { User } from '@/entities/user';",
                    filename: '/project/src/entities/user/model/types.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                },
                {
                    code: "export * from '@/entities/user';",
                    filename: '/project/src/entities/user/model/types.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                }
            ]
        });
    });
});

test('no-slice-self-import: shared/lib слайсоподобные сегменты', async (ctx) => {
    await ctx.test('импорт своего shared/lib модуля — запрещён', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [],
            invalid: [
                {
                    code: "import { formatDate } from '@/shared/lib/date';",
                    filename: '/project/src/shared/lib/date/formatReadingTime.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                },
                {
                    code: "import { formatDate } from '@/shared/lib/date/server';",
                    filename: '/project/src/shared/lib/date/utils.ts',
                    errors: [{ messageId: 'noSliceSelfImport' }]
                }
            ]
        });
    });

    await ctx.test('импорт чужого shared/lib модуля — ок', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [
                {
                    code: "import { formatDate } from '@/shared/lib/date';",
                    filename: '/project/src/shared/lib/forum/utils.ts'
                },
                {
                    code: "import { apiClient } from '@/shared/api/app';",
                    filename: '/project/src/shared/lib/date/utils.ts'
                }
            ],
            invalid: []
        });
    });

    await ctx.test('barrel в shared/lib — разрешён', () => {
        tester.run('no-slice-self-import', rule, {
            valid: [
                {
                    code: "export { formatDate } from './formatDate';",
                    filename: '/project/src/shared/lib/date/index.ts'
                }
            ],
            invalid: []
        });
    });
});
