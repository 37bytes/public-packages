#!/usr/bin/env node

import prepareEnvironment from './prepareEnviroment';
import extractLaunchArguments from './utils/extractLaunchArguments';
import ProcessArgument from './constants/ProcessArgument';
import getArgument from './utils/getArgument';
import { loadRcFile } from './utils/loadRcFile';
import { ConfigData } from './types';
import { CONFIG_FILE_NAME } from './constants/ConfigFileName';
import { getPackageProperty } from './utils/getPackageProperty';

const { config: packageVersion } = getPackageProperty({ packageJsonProperty: 'version' });
const { config: packageName } = getPackageProperty({ packageJsonProperty: 'name' });

const { config: dependencies } = getPackageProperty({ packageJsonProperty: 'dependencies' });
const scriptName = `prepareEnvironment@${dependencies['@37bytes/prepare-environment']}`;

if (!packageName || !packageVersion) {
    throw new Error('package.json is empty');
}
const appName = `${packageName}@${packageVersion}`;
console.log(`${scriptName} called for ${appName}`);

const { ...restArguments } = extractLaunchArguments();
console.log('launch arguments processed!', { ...restArguments });

const configurationPath = getArgument(restArguments, ProcessArgument.CONFIG_PATH);

try {
    const configData = loadRcFile<ConfigData>({ rcFileName: CONFIG_FILE_NAME, configurationPath });
    console.log('The configuration has been received, start prepareEnvironment', configData.config);
    prepareEnvironment({ configData: configData.config, cliArguments: restArguments, appName });
} catch (error) {
    throw new Error(error);
}
