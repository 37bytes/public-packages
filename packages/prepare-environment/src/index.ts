#!/usr/bin/env node

import prepareEnvironment from './prapareEnviroment';
import extractLaunchArguments from './utils/extractLaunchArguments';

const { name: packageName, version: packageVersion } = require('../package.json');
console.log(`${packageName}@${packageVersion} called!`);

const { CONFIG_PATH } = extractLaunchArguments();
console.log('launch arguments processed!', { CONFIG_PATH });

prepareEnvironment({ configPath: CONFIG_PATH });
