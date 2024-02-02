[[English](./README.md)] | [Русский](./README_RU.md)

# @37bytes/smart-url-search-params

A powerful and enhanced version of the standard URLSearchParams, `@37bytes/smart-url-search-params` offers extended capabilities for handling URL query strings. It supports arrays, numbers, and allows for handling null and undefined values, providing a more flexible way to work with URL parameters.

## Features

- **Extended Data Types**: Supports strings, arrays, numbers, null, and undefined values.
- **Advanced Array Formatting**: Customize how array parameters are represented in the query string.
- **Compatible with URLSearchParams**: Fully compatible with standard URLSearchParams API.

## Installation

```bash
npm install @37bytes/smart-url-search-params
```

```bash
yarn add @37bytes/smart-url-search-params
```

## Usage

Import `SmartURLSearchParams` in your JavaScript or TypeScript file:

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
## Advanced Usage of `toFormattedString`

The `toFormattedString` method in `SmartURLSearchParams` allows for customized formatting of query strings, especially for array parameters. Here are some examples demonstrating its capabilities:

### Default Array Formatting (No Formatting)

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'none' }));
// Outputs: 'items=apple&items=banana&items=cherry'
```

### Bracket Array Formatting

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'bracket' }));
// Outputs: 'items[]=apple&items[]=banana&items[]=cherry'
```

### Index Array Formatting

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'index' }));
// Outputs: 'items[0]=apple&items[1]=banana&items[2]=cherry'
```

### Comma-Separated Array Formatting

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'comma' }));
// Outputs: 'items=apple,banana,cherry'
```

### Custom Separator Array Formatting

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'separator', arrayFormatSeparator: '|' }));
// Outputs: 'items=apple|banana|cherry'
```

### Bracket with Custom Separator Array Formatting

```javascript
const params = new SmartURLSearchParams({ items: ['apple', 'banana', 'cherry'] });
console.log(params.toFormattedString({ arrayFormat: 'bracket-separator', arrayFormatSeparator: '|' }));
// Outputs: 'items[]=apple|banana|cherry'
```
