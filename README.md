[[English](./README.md)] | [Русский](./README_RU.md)

## Setup

```bash
pnpm install
```

## Core (internal, not published)

- [bundler](/core/bundler) - shared tsdown/build configuration for workspace packages

## Packages

Configuration:
- [code-style](/packages/code-style)

Libraries:
- [configurable-media-context](/packages/configurable-media-context)
- [logstory](/packages/logstory)
- [smart-url-search-params](/packages/smart-url-search-params)
- [social-media-sharing](/packages/social-media-sharing)
- [storage-fallback](/packages/storage-fallback)
- [units-helper](/packages/units-helper)
- [vite-build-time-environment](/packages/vite-build-time-environment)
- [vite-dynamic-environments](/packages/vite-dynamic-environments)

## Legacy (deprecated)

Use [@37bytes/code-style](/packages/code-style) instead of the config packages below:
- [eslint-config](/legacy/eslint-config)
- [prettier-config](/legacy/prettier-config)
- [stylelint-config](/legacy/stylelint-config)

CLI utilities (unmaintained):
- [front-proxy](/legacy/front-proxy)
- [html-content-appender](/legacy/html-content-appender)
- [prepare-environment](/legacy/prepare-environment)
- [sentry-release-publisher](/legacy/sentry-release-publisher)
