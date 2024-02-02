#!/usr/bin/env node
import fs from 'fs';
import { parse } from 'dotenv';
import path from 'path';
import extractLaunchArguments from './utils/extractLaunchArguments';
import replaceInDirectory from './utils/replaceInDirectory';

const { name: packageName, version: packageVersion } = require('../package.json');
console.log(`${packageName}@${packageVersion} called!`);

const { TARGET_DIRECTORY, ENVIRONMENT_CONFIG } = extractLaunchArguments();
console.log('launch arguments processed!', { TARGET_DIRECTORY, ENVIRONMENT_CONFIG });

const dynamicEnvironment = parse(fs.readFileSync(path.resolve(process.cwd(), ENVIRONMENT_CONFIG)));

const initialPath = path.resolve(process.cwd(), TARGET_DIRECTORY);
console.log('calling replaceInDirectory...', initialPath);
// Запуск функции для директории из параметров
replaceInDirectory(initialPath, dynamicEnvironment);
