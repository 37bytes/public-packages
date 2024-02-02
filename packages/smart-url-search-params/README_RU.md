[English](./README.md) | [[Русский](./README_RU.md)]

# @37bytes/smart-url-search-params

Мощная и улучшенная версия стандартного URLSearchParams, @37bytes/smart-url-search-params предлагает расширенные возможности для работы со строками запросов URL. Она поддерживает массивы, числа и позволяет обрабатывать значения null и undefined, обеспечивая более гибкий способ работы с параметрами URL.

## Особенности
- **Расширенные типы данных**: Поддержка строк, массивов, чисел, null и undefined.
- **Продвинутое форматирование массивов**: Настраивайте представление параметров массива в строке запроса.
- **Совместимость с URLSearchParams**: Полная совместимость с API стандартного URLSearchParams.

## Установка

```bash
npm install @37bytes/smart-url-search-params
```

```bash
yarn add @37bytes/smart-url-search-params
```

## Использование

Импортируйте SmartURLSearchParams в вашем файле JavaScript или TypeScript:

```typescript
import SmartURLSearchParams from '@37bytes/smart-url-search-params';

// Initializing with various types of values
const params = new SmartURLSearchParams({
    stringParam: 'value',
    numberParam: 123,
    arrayParam: ['arrayValue1', 'arrayValue2'],
    nullParam: null,
    undefinedParam: undefined
});

// Example of using toFormattedString for custom array formatting
const formattedString = params.toFormattedString({ arrayFormat: 'bracket' });
console.log(formattedString); // Outputs: 'stringParam=value&numberParam=123&arrayParam[]=arrayValue1&arrayParam[]=arrayValue2'
```
## Расширенное использование `toFormattedString`

Метод `toFormattedString` в `SmartURLSearchParams` позволяет настраивать форматирование строк запросов, особенно для параметров массива. Вот несколько примеров, демонстрирующих его возможности:

### Стандартное форматирование массива (без форматирования, аналогично toString)

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'none' }));
// Outputs: 'items=apple&items=banana&items=cherry'
```

### Форматирование массива со скобками

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'bracket' }));
// Outputs: 'items[]=apple&items[]=banana&items[]=cherry'
```

### Форматирование массива с индексами

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'index' }));
// Outputs: 'items[0]=apple&items[1]=banana&items[2]=cherry'
```

### Форматирование массива с разделителями-запятыми

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'comma' }));
// Outputs: 'items=apple,banana,cherry'
```

### Форматирование массива с пользовательским разделителем

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'separator', arrayFormatSeparator: '|' }));
// Outputs: 'items=apple|banana|cherry'
```

### Форматирование массива со скобками и пользовательским разделителем

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'bracket-separator', arrayFormatSeparator: '|' }));
// Outputs: 'items[]=apple|banana|cherry'
```
