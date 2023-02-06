#!/usr/bin/env node

import prepareEnvironment from './prapareEnviroment';
import extractLaunchArguments from './utils/extractLaunchArguments';
import ProcessArgument from './constants/ProcessArgument';
import getArgument from './utils/getArgument';
import { loadRcFile } from './utils/loadRcFile';

const { name: packageName, version: packageVersion } = require('../package.json');
console.log(`${packageName}@${packageVersion} called!`);

const { ...restArguments } = extractLaunchArguments();
console.log('launch arguments processed!', { ...restArguments });

const configurationPath = getArgument(restArguments, ProcessArgument.CONFIG_PATH);

function checkData(configData: { config: object; filePath: string }) {
    if (Object.keys(configData.config).length === 0)
        throw Error(`config not found by filePath${configData.filePath} or it's an empty`);
}

try {
    const configData = loadRcFile({ rcFileName: 'prepare', configurationPath });
    checkData(configData);
    console.log('The configuration has been received, start prepareEnvironment', configData.config);
    prepareEnvironment({ configData: configData.config, cliArguments: restArguments });
} catch (error) {
    console.error(error);
    throw new Error(error);
}
