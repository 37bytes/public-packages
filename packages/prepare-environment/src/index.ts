#!/usr/bin/env node

import prepareEnvironment from './prapareEnviroment';
import extractLaunchArguments from './utils/extractLaunchArguments';
import ProcessArgument from './constants/ProcessArgument';
import getArgument from './utils/getArgument';
import { loadRcFile } from './utils/loadRcFile';
import { ConfigData } from './types';

const { config: packageVersion } = loadRcFile({ rcFileName: 'package.json', packageJsonProperty: 'version' });
const { config: packageName } = loadRcFile({ rcFileName: 'package.json', packageJsonProperty: 'name' });

if (!packageName || !packageVersion) {
    throw new Error('package.json is empty');
}
const appName = `${packageName}@${packageVersion}`;
console.log(`prepareEnvironment called for ${appName}`);

const { ...restArguments } = extractLaunchArguments();
console.log('launch arguments processed!', { ...restArguments });

const configurationPath = getArgument(restArguments, ProcessArgument.CONFIG_PATH);

function checkData(configData: { config: object; filePath: string }) {
    if (Object.keys(configData.config).length === 0)
        throw Error(`config not found by filePath${configData.filePath} or it's an empty`);
}

try {
    const configData = loadRcFile<ConfigData>({ rcFileName: 'prepare', configurationPath });
    checkData(configData);
    console.log('The configuration has been received, start prepareEnvironment', configData.config);
    prepareEnvironment({ configData: configData.config, cliArguments: restArguments, appName });
} catch (error) {
    console.error(error);
    throw new Error(error);
}
