#!/usr/bin/env node
import SentryCli from '@sentry/cli';
import rimraf from 'rimraf';
import extractLaunchArguments from './utils/extractLaunchArguments';
import extractReleaseName from './utils/extractReleaseName';
import getArgument from './utils/getArgument';
import ProcessArgument from './constants/ProcessArgument';
import isTrue from './utils/isTrue';
import uploadRelease from './utils/uploadRelease';

const { name: packageName, version: packageVersion } = require('../package.json');
console.log(`${packageName}@${packageVersion} called!`);

const { SENTRY_TOKEN, SENTRY_URL, SENTRY_ORG, SENTRY_PROJECT, ...restArguments } = extractLaunchArguments();
console.log('launch arguments processed!', { SENTRY_URL, SENTRY_ORG, SENTRY_PROJECT, ...restArguments });

let releaseName = getArgument(restArguments, ProcessArgument.RELEASE_NAME);
if (!releaseName) {
    console.log('looking for release name...');
    releaseName = extractReleaseName({
        configName: getArgument(restArguments, ProcessArgument.RELEASE_CONFIG_NAME, '.env.production'),
        variableName: getArgument(restArguments, ProcessArgument.CONFIG_RELEASE_VARIABLE, 'REACT_APP_SENTRY_RELEASE')
    });
}
console.log(`release name is ${releaseName}`);

const releaseDirectory = getArgument(restArguments, ProcessArgument.RELEASE_DIRECTORY, 'build');
uploadRelease({
    cli: new SentryCli(null, {
        url: SENTRY_URL,
        org: SENTRY_ORG,
        project: SENTRY_PROJECT,
        authToken: SENTRY_TOKEN
    }),
    releaseName,
    releaseDirectory,
    staticDirectory: getArgument(restArguments, ProcessArgument.STATIC_DIRECTORY, 'static/js')
})
    .catch((error) => {
        console.warn('uploadRelease failed!');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => {
        if (isTrue(restArguments.KEEP_SOURCE_MAPS)) {
            console.log(`WARNING! ${ProcessArgument.KEEP_SOURCE_MAPS} is true, skip source map removing!`);
        } else {
            console.log('removing source maps...');
            rimraf.sync(`${releaseDirectory}/**/*.map`);
            console.log('source maps removed!');
        }

        console.log(`${packageName}@${packageVersion} finished!`);
    });
