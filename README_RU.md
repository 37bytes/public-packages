[English](./README.md) | [[Русский](./README_RU.md)]

## Установка

```bash
pnpm install
```

## Core (внутренние, не публикуются)

- [bundler](/core/bundler) - общая конфигурация tsdown/сборки для пакетов монорепы

## Пакеты

Конфиги:
- [code-style](/packages/code-style)

Библиотеки:
- [configurable-media-context](/packages/configurable-media-context)
- [logstory](/packages/logstory)
- [smart-url-search-params](/packages/smart-url-search-params)
- [social-media-sharing](/packages/social-media-sharing)
- [storage-fallback](/packages/storage-fallback)
- [units-helper](/packages/units-helper)
- [vite-build-time-environment](/packages/vite-build-time-environment)
- [vite-dynamic-environments](/packages/vite-dynamic-environments)

## Legacy (устаревшие)

Вместо конфигурационных из списка нужно использовать [@37bytes/code-style](/packages/code-style):
- [eslint-config](/legacy/eslint-config)
- [prettier-config](/legacy/prettier-config)
- [stylelint-config](/legacy/stylelint-config)

Другие deprecated:
- [front-proxy](/legacy/front-proxy)
- [html-content-appender](/legacy/html-content-appender)
- [prepare-environment](/legacy/prepare-environment)
- [sentry-release-publisher](/legacy/sentry-release-publisher)
