[![npm version](https://badge.fury.io/js/@37bytes%2Fsentry-release-publisher.svg)](https://badge.fury.io/js/@37bytes%2Fsentry-release-publisher)

### Usage

1. `sentry-release-publisher SENTRY_URL=https://sentry.io SENTRY_TOKEN=123 SENTRY_ORG=example SENTRY_PROJECT=test`  
In this case app looking for release name in config.

2. `sentry-release-publisher SENTRY_URL=https://sentry.io SENTRY_TOKEN=123 SENTRY_ORG=example SENTRY_PROJECT=test RELEASE_NAME=app@1.2`  
In this case app skip config reading.

### Optional parameters default values
- RELEASE_DIRECTORY = `build`,
- STATIC_DIRECTORY = `static/js`,
- RELEASE_NAME = `undefined`',
- RELEASE_CONFIG_NAME = `.env.production`,
- CONFIG_RELEASE_VARIABLE = `REACT_APP_SENTRY_RELEASE`,
- KEEP_SOURCE_MAPS = `undefiend`' ;

### Local developing
1. `ts-node src/index.ts <...>`
2. `npm run build&watch`; `node build/index.js <...>`
3. `npm run build`; `chmod +x build/index.js`; `npm link`; `sentry-release-publisher <...>`

### version history
1.0.8
- added the ability to ignore the parameter `STATIC_DIRECTORY` (if value is `.`)

1.0.7
- default path for `STATIC_DIRECTORY` replaced to `static/js`

1.0.6
- small typing improvement for `getArgument`
- add new optional ProcessArgument, STATIC_DIRECTORY, path to source maps now is `${releaseDirectory}/${staticDirectory}/js`

1.0.5
- fix actions order (uploading - cleanup - finish)

1.0.4
- remove source maps after uploading
- add flag for disabling source map removing (KEEP_SOURCE_MAPS)

1.0.3
- fix ProcessArgument.CONFIG_RELEASE_VARIABLE

- 1.0.1
- improve package building

1.0.0
- first version
