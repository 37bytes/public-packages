# Naming Conventions (@37bytes)

## Переменные и константы

Переменные: `camelCase`.

```js
const userName = 'Alice';
let itemCount = 0;
```

Примитивные константы модуля: `UPPER_CASE`.

```js
const MAX_RETRIES = 3;
const API_BASE_URL = '/api/v1';
```

Объектные константы: `camelCase`.

```js
const defaultConfig = { timeout: 1000 };
const allowedRoles = ['admin', 'editor'];
```

Деструктуризация из API: переименовать в `camelCase`.

```js
const { user_id: userId, created_at: createdAt } = response;
```

Неиспользуемые параметры: `_` prefix.

```ts
const handler = (_event, index) => {
    /* ... */
};
array.filter((_item, index) => index > 0);
```

## Функции

Именование: `camelCase`. Всегда стрелочные функции, `function` declarations запрещены (кроме случаев, где стрелки невозможны: overloads, генераторы).

```js
const getUserData = () => {
    /* ... */
};
const formatPrice = (value) => `$${value.toFixed(2)}`;
```

Если тело состоит из одного выражения, фигурные скобки не нужны.

```js
const double = (x) => x * 2;
const getFullName = (user) => `${user.first} ${user.last}`;
```

Колбэк-пропсы: префикс `on*`.

```tsx
<Button onClick={submitForm} onHover={showTooltip} />
```

Хэндлеры внутри компонента: семантические имена. Префикс `handle*` не обязателен.

```tsx
const LoginForm = () => {
    const submitForm = () => {
        /* ... */
    };
    const resetPassword = () => {
        /* ... */
    };

    return <form onSubmit={submitForm} />;
};
```

## Блоки управления

Всегда фигурные скобки для `if`, `for`, `while`, `do`.  
Вложенные тернарники запрещены.

## Классы

Имя: `PascalCase`. Приватные поля и методы: `#` prefix.

```js
class Service {
    #cache = new Map();
    #fetchData() {
        /* ... */
    }
}
```

## TypeScript

Интерфейсы и типы: `PascalCase` без префиксов `I` и `T`.

```ts
interface UserData {
    id: string;
    name: string;
}

type UserId = string | number;
```

Дженерики: `PascalCase` без `T`-префикса. Одиночная `T` допустима.

```ts
const identity = <T>(value: T): T => value;
const merge = <Source, Target>(source: Source, target: Target): Source & Target => {
    /* ... */
};
```

В новых проектах enum запрещены. Вместо enum конструкция вида `as const` + вывод типа.

```ts
const HTTP_STATUS = {
    OK: 200,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
} as const;

type HttpStatus = typeof HTTP_STATUS;
```

В legacy-проектах, где enum еще используется: `PascalCase` для имени, `UPPER_CASE` для членов.

```ts
enum HttpStatus {
    OK = 200,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}
```

`@ts-expect-error` вместо `@ts-ignore`, с пояснением.

```ts
// @ts-expect-error: библиотека не экспортирует тип, фикс в ABC-123
const result = someLibrary.problematicMethod();
```

`boolean | null` запрещен. Для опциональных булеанов: `?: boolean`.

```ts
interface FormState {
    isValid: boolean;
    isSubmitting?: boolean;
}
```

## Длина имен

Минимум 3 символа. Исключения: `e`, `id`, `n`, `ts`, `x`, `y`, `_`.

```ts
const e = new Error();
const id = user.id;
const [x, y] = getCoords();
```

## Аббревиатуры

Сокращения запрещены, кроме белого списка: `args`, `ctx`, `def`, `dev`, `dir`, `docs`, `env`, `lib`, `param`, `params`, `pkg`, `prev`, `prod`, `prop`, `props`, `ref`, `refs`, `src`, `utils`.

```ts
const buttonRef = useRef(null);
const prevState = history.at(-1);
```

## Магические числа

Числовые литералы выносить в именованные константы. Допустимы инлайн: `0`, `1`, `-1`.

```ts
const SECONDS_IN_MINUTE = 60;
const MAX_PASSWORD_LENGTH = 128;
const OPACITY_HALF = 0.5;

const timeLeft = totalSeconds % SECONDS_IN_MINUTE;
const isValid = password.length <= MAX_PASSWORD_LENGTH;
```

## Булеаны

Префиксы: `is`, `has`, `should`, `can`, `did`, `will`, `are`.

```ts
const isActive = true;
const hasAccess = checkPermissions();
const shouldRetry = attempts < MAX_RETRIES;
```

## React-компоненты

Имя компонента: `PascalCase`, arrow function, типизация через `FunctionComponent`.

```tsx
const UserProfile: FunctionComponent<Props> = ({ name }) => {
    return <div>{name}</div>;
};
```

Props-интерфейс: `Props` для внутренних компонентов, `<Name>Props` для экспортируемых. Колбэки в method signature синтаксисе.

```tsx
// Внутренний компонент
interface Props {
    label: string;
    onClick(): void;
}

// Экспортируемый компонент
export interface ButtonProps {
    label: string;
    onClick(): void;
    onSubmit(data: FormData): void;
}
```

Boolean-пропсы: HTML-стиль (без `is`/`has`). Внутри компонента деструктурировать с переименованием.

```tsx
// Использование
<Button disabled loading />;

// Объявление
interface ButtonProps {
    disabled?: boolean;
    loading?: boolean;
}

const Button = ({ disabled: isDisabled, loading: isLoading }: ButtonProps) => {
    if (isDisabled) return null;
    // ...
};
```

## Именование файлов

Компоненты: `PascalCase`.

```
UserProfile.tsx
LoginForm.tsx
```

Функции, утилиты, хуки: `camelCase`.

```
formatPrice.ts
useAuth.ts
apiClient.ts
```

Наборы констант: `camelCase`, единственное число для группы.

```
pattern.ts
httpStatus.ts
```

Enum'ы и аналоги (`as const`): `PascalCase`.

```
HttpHeader.ts
RequestMethod.ts
```

Фреймворк-специфичные файлы: по конвенции фреймворка.

```
layout.tsx          // Next.js
page.tsx            // Next.js
middleware.ts       // Next.js
vite.config.ts      // Vite
```
