[//]: # (todo: уточнить название по конвенции)
# Vite Dynamic Environments Support Plugin

Этот плагин предоставляет поддержку динамических окружений для проектов, использующих Vite. Он обеспечивает автоматическую генерацию скриптов с переменными окружения в процессе разработки, что упрощает работу с различными конфигурациями окружения.

## Установка

Установите плагин с помощью npm:

```bash
npm install @37bytes/vite-dynamic-environments --save-dev
```

## Использование
```
// vite.config.js
import dynamicEnvironmentsSupport from '@37bytes/vite-dynamic-environments';

export default {
  plugins: [
    dynamicEnvironmentsSupport({
      // Параметры плагина (необязательно, указаны значения по умолчанию)
      scriptLink: '/dynamicEnvironment.js', // Ссылка для подключения скрипта в HTML
      ignorePrefixes: ['VITE_'], // Префиксы переменных окружения, которые нужно игнорировать
      dynamicEnvironmentsDir: 'environments/dynamic', // Директория с файлами динамических окружений
      outputDir: 'build-env' // Директория для вывода сгенерированных скриптов
    })
  ]
};
```

## Опции

### scriptLink
Ссылка, по которой будет доступен скрипт с переменными окружения во время разработки (по умолчанию: ```'/dynamicEnvironment.js'```)

### ignorePrefixes
Префиксы переменных окружения, которые нужно игнорировать при генерации скрипта (по умолчанию: ```['VITE_']```)

### dynamicEnvironmentsDir
Директория с файлами динамических окружений (по умолчанию: ```'environments/dynamic'```)

### outputDir
Директория для вывода сгенерированных скриптов (по умолчанию: ```'build-env'```)
