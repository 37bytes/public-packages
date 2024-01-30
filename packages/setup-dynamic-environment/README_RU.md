# Setup Dynamic Environment Plugin

Этот плагин предоставляет утилиту командной строки для рекурсивной замены строк-шаблонов в файлах JavaScript в указанном каталоге на объект динамического окружения.

## Установка

```
npm install dynamic-environment-replacer
```
## Использование
секция "scripts" в package.json
```
"build": " your_build_script && dynamic-environment-replacer --TARGET_DIRECTORY=<target_directory> --ENVIRONMENT_CONFIG=<environment_config>"
```
### TARGET_DIRECTORY:
Целевой каталог, содержащий файлы JavaScript, в которые будут произведены замены.

### ENVIRONMENT_CONFIG:
Путь к файлу конфигурации окружения в формате dotenv.

## Пример

```
"build": "rimraf build && npm run prebuild && setup-dynamic-environment TARGET_DIRECTORY=build ENVIRONMENT_CONFIG=.env.production",
```

## Динамическая замена

Плагин заменяет шаблонную строку ```"__PLACE_FOR_DYNAMIC_ENVIRONMENT__"``` с сериализованным представлением переменных окружения, определенных в указанном файле ENVIRONMENT_CONFIG.
