[[English](./README.md)] | [Русский](./README_RU.md)

# @37bytes/vite-build-time-environment

This plugin allows injecting version, branch, and commit information into code during build time. This is particularly useful for:
- Version tracking in production environment
- Debugging issues across different builds
- Automating release process

## Installation

```shell
npm install @37bytes/vite-build-time-environment
```

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import createBuildTimeIdentifiersSupportPlugin from '@37bytes/vite-build-time-environment';
import packageInfo from '../package.json';

// Other parameters are pulled from environment variables
const buildTimeIdentifiersSupportPlugin = createBuildTimeIdentifiersSupportPlugin({
    packageName: packageInfo.name,
    packageVersion: packageInfo.version
});

export default defineConfig({
    // ...
    plugins: [
        buildTimeIdentifiersSupportPlugin,
        // ...
    ]
    // ...
});
```

## Environment Variables

The plugin uses the following environment variables:

| Environment Variable | Description | Default Value When Missing |
|---------------------|-------------|---------------------------|
| `VERSION` | Build version | `[unknown build version]` |
| `BRANCH` | Current Git branch | `[unknown git branch]` |
| `COMMIT_HASH` | Current commit hash | `[unknown commit hash]` |

Environment variable names can be changed using the `aliases` parameter (see "Optional Parameters" section).

## Parameters

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `packageName` | `string` | Package name |
| `packageVersion` | `string` | Package version |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `aliases.VERSION_FIELD_NAME` | `string` | `'VERSION'` | Environment variable name for build version |
| `aliases.BRANCH_FIELD_NAME` | `string` | `'BRANCH'` | Environment variable name for Git branch |
| `aliases.COMMIT_HASH_FIELD_NAME` | `string` | `'COMMIT_HASH'` | Environment variable name for commit hash |

## Available Variables

After configuring the plugin, the following global variables will be available in your code:

| Variable | Description |
|----------|-------------|
| `PACKAGE_INFO_FIELD_NAME` | Package name |
| `PACKAGE_INFO_FIELD_VERSION` | Package version |
| `BUILD_TIME_VARIABLES_VERSION` | Build version (from environment variable) |
| `BUILD_TIME_VARIABLES_BRANCH` | Current Git branch |
| `BUILD_TIME_VARIABLES_COMMIT_HASH` | Current commit hash |
| `BUILD_TIME_VARIABLES_RELEASE_NAME` | Full release name in format `packageName@packageVersion+version` |

### Build Example

```shell
VERSION=1.0.0-beta BRANCH=feature/new-plugin COMMIT_HASH=abc123 vite build
```

## Code Usage Example

vite-end.d.ts:
```typescript
// ...
/// <reference types="@37bytes/vite-build-time-environment/client" />
// ...
```

```typescript
export const packageInfo = {
    name: PACKAGE_INFO_FIELD_NAME,
    version: PACKAGE_INFO_FIELD_VERSION
};

export const buildTimeVariables = {
    version: BUILD_TIME_VARIABLES_VERSION,
    branch: BUILD_TIME_VARIABLES_BRANCH,
    commitHash: BUILD_TIME_VARIABLES_COMMIT_HASH,
    releaseName: BUILD_TIME_VARIABLES_RELEASE_NAME
};
```

## Aliases Configuration Example

```typescript
buildTimeIdentifiersPlugin({
    packageName: 'my-app',
    packageVersion: '1.0.0',
    aliases: {
        VERSION_FIELD_NAME: 'MY_APP_VERSION',
        BRANCH_FIELD_NAME: 'MY_APP_BRANCH',
        COMMIT_HASH_FIELD_NAME: 'MY_APP_COMMIT'
    }
})
```

## Default Values

When corresponding environment variables are not set, the plugin uses these default values:

- For `BUILD_TIME_VARIABLES_BRANCH`: `[unknown git branch]`
- For `BUILD_TIME_VARIABLES_COMMIT_HASH`: `[unknown commit hash]`
- For `BUILD_TIME_VARIABLES_VERSION`: `[unknown build version]`
