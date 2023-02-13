#!/usr/bin/env node

import { prepareCommitMessage } from './prepareCommitMessage';
import extractLaunchArguments from './utils/extractLaunchArguments';
import { loadRcFile } from './utils/loadRcFile';
import { ConfigData } from './types';
import getArgument from './utils/getArgument';
import ProcessArgument from './constants/ProcessArgument';

const { config: packageVersion } = loadRcFile({ rcFileName: 'package.json', packageJsonProperty: 'version' });
const { config: packageName } = loadRcFile({ rcFileName: 'package.json', packageJsonProperty: 'name' });

if (!packageName || !packageVersion) {
    throw new Error('package.json is empty');
}
const appName = `${packageName}@${packageVersion}`;
console.log(`prepareCommitMessage called for ${appName}`);

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
    console.log('The configuration has been received, start prepareCommitMessage', configData.config);
    prepareCommitMessage({ configData: configData.config, cliArguments: restArguments });
} catch (error) {
    console.error(error);
    throw new Error(error);
}
