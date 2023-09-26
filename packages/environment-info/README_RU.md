### О проекте

Набор утилит для улучшения работы с внутренними стендами

### Установка

Выполните следующую команду, чтобы установить пакет:

```sh
npm install --save-dev stylelint @37bytes/environment-info
```

### Описание

#### getEnvironmentInfo
Утилита для получения информации о текущей версии приложения и текущем стенде. 
При вызове возвращает строку.

На вход передается объект с полями:

| Поле             |   Тип   | Обязательность |                  Описание |
|------------------|:-------:|:--------------:|--------------------------:|
| stand            | string  |       +        |       Наименование стенда |
| version          | string  |       -        | Текущая версия приложения |
| commitHash       | string  |       -        |            Текущий коммит |
| branch           | string  |       -        |             Текущая ветка |
| isProduction     | boolean |       -        |   Признак продакшн стенда |
                    
Если ``isProduction = true`` ответ вернет строку вида:
``${version}``, 
иначе утилита вернет строку вида: 
``${version}|${stand}; ${branch}#${commitHash}`` 

**Важно:** При вычислении, прод ли это, используем не список prod-окружений, а список внутренних.
Пример:

```javascript
const isProductionEnvironment = (envName: string) => {
    if (import.meta.env.DEV) {
        return false;
    }
    
    if (['test', 'stage'].includes(envName)) {
        return false;
    }
    
    return true;
}
```

#### startEnvironmentTitleWatcher
Утилита для добавления наименования стенда в title вкладки в браузере. 
Принимает один аргумент: ``standName: string``.


### История версий

1.0.0
- Первая версия.
