### О проекте

Конфигурация stylelint для использования в проектах компании 37bytes. 

### Используемые правила

- Запрет на селекторы без классов.
- Запрет дублирования свойств в рамках селектора.
- Запрет дублирования наименования селектора в рамках файла.
- Запрет пустого селектора.
- Ограничение на использование единиц измерения для размера шрифтов (только px).
- Сортировка и группировка свойств в селекторе в соответствии с заданным порядком.
- Ограничение на использование определенных значений для некоторых свойств (для color, background-color, border-color, z-index, font-family в качестве значений могут использоваться только переменные).
- Ограничение на тип написания наименований (lowerCamelCase).
- Запрет пустых комментариев.

### Установка

Выполните следующую команду, чтобы установить пакет:

```sh
npm install --save-dev stylelint @37bytes/stylelint-config
```

### Использование

Создайте файл `.stylelintrc` в корне вашего проекта и настройте конфигурацию следующим образом:

```json
{
    "extends": "@37bytes/stylelint-config"
}
```

По необходимости вы можете дополнительно настроить вашу конфигурацию согласно [документации](https://stylelint.io/) stylelint.

Добавьте следующую команду в ваш `package.json`, чтобы запустить проверку стилей:

```
"lint:styles": "stylelint **/*.{scss,css} --fix"
```

### История версий

1.0.12
- scale-unlimited/declaration-strict-value: "disableFix": true

1.0.10
- Обновление правил для использования переменных

1.0.9
- Обновление документации.

1.0.8
- Добавлена документация.

1.0.7
- Мелкие исправления

1.0.6
- Мелкие исправления

1.0.5
- Мелкие исправления

1.0.4
- Мелкие исправления

1.0.3
- Мелкие исправления

1.0.2
- Мелкие исправления

1.0.1
- Мелкие исправления

1.0.0
- Первая версия.
