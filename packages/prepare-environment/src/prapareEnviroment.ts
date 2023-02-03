interface PrepareEnvironmentParams {
    configPath: string | unknown;
}
const prepareEnvironment = ({ configPath }: PrepareEnvironmentParams) => {
    console.debug({ configPath });
};

export default prepareEnvironment;

// const fs = require('fs');
// const path = require('path');
//
// const packageDescription = require('./package.json');
// if (!packageDescription || !packageDescription.name || !packageDescription.version) {
// 	throw new Error('package.json is empty');
// }
// const appName = `${packageDescription.name}@${packageDescription.version}`;
// console.log(`prepareEnvironment called for ${appName}`);
//
// // region константы
// const pathToResultConfig = path.resolve(__dirname, './.env.production');
// const pathToEnvironmentsFolder = path.resolve(__dirname, './environments');
// console.log({ pathToResultConfig, pathToEnvironmentsFolder });
// // endregion
//
// // region вспомогательные функции
// const getPathToSourceConfig = (targetEnvironment) => `${pathToEnvironmentsFolder}/.env.${targetEnvironment}`;
// // endregion
//
// // region аргументы командной строки
// const KEY_ENV_NAME = 'ENV_NAME';
// const KEY_CAL_VAR = 'CAL_VER';
// const KEY_COMMIT_SHORT_SHA = 'COMMIT_SHORT_SHA';
// const KEY_REF_NAME = 'REF_NAME';
//
// const allowedArgumentNames = [KEY_ENV_NAME, KEY_CAL_VAR, KEY_COMMIT_SHORT_SHA, KEY_REF_NAME];
// const requiredArgumentNames = [KEY_ENV_NAME];
// const allowedEnvironments = ['legacy_prod', 'legacy_stage', 'legacy_odr', 'stage', 'prod'];
//
// const configVariablesByArguments = {
// 	[KEY_ENV_NAME]: 'REACT_APP_ENV_NAME',
// 	[KEY_CAL_VAR]: 'REACT_APP_CAL_VER',
// 	[KEY_COMMIT_SHORT_SHA]: 'REACT_APP_COMMIT_SHORT_SHA',
// 	[KEY_REF_NAME]: 'REACT_APP_REF_NAME'
// };
// // endregion
//
// console.log('preparing environment...\n');
//
// // region сбор значимых параметров запуска в объект
// console.log(`parsing arguments by allowedArgumentNames ([${allowedArgumentNames}])...`);
// const scriptArguments = process.argv.reduce((result, argument) => {
// 	if (!allowedArgumentNames.some((argumentName) => argument.startsWith(argumentName))) {
// 		return result;
// 	}
//
// 	const [name, value] = argument.split('=');
// 	if (value !== undefined && value !== '') {
// 		result[name] = value;
// 	}
//
// 	return result;
// }, {});
// console.log(JSON.stringify(scriptArguments));
// console.log('arguments parsed!\n');
// // endregion
//
// // region валидация
// console.log('validating required arguments...');
// console.log(`required arguments is [${requiredArgumentNames}]`);
// const emptyRequiredArguments =
// 	Object.keys(scriptArguments).length === 0
// 		? requiredArgumentNames
// 		: Object.keys(scriptArguments).filter(
// 			(argumentName) => requiredArgumentNames.includes(argumentName) && !scriptArguments[argumentName]
// 		);
// if (emptyRequiredArguments.length > 0) {
// 	throw new Error(
// 		`Script arguments validation failed! Required arguments is missed ([${emptyRequiredArguments.toString()}]) `
// 	);
// }
// console.log('validation passed!\n');
// // endregion
//
// // region поиск подходящего env-файла
// console.log('finding config...');
// const targetEnvironment = scriptArguments[KEY_ENV_NAME];
// if (!targetEnvironment || !allowedEnvironments.includes(targetEnvironment)) {
// 	throw new Error(
// 		`targetEnvironment unknown, current value is "${targetEnvironment}", available values is [${allowedEnvironments}]`
// 	);
// }
// console.log(`target environment found! ${targetEnvironment}`);
// const pathToSourceConfig = getPathToSourceConfig(targetEnvironment);
// console.log(`path to source config is "${pathToSourceConfig}"`);
//
// if (!fs.existsSync(pathToSourceConfig)) {
// 	throw new Error(`source config not found!`);
// }
// console.log('source config exists!\n');
// // endregion
//
// // region копирование env-файла
// console.log(`coping source config to ${pathToResultConfig}...`);
// try {
// 	fs.copyFileSync(pathToSourceConfig, pathToResultConfig);
// 	console.log(`config copied!\n`);
// } catch (error) {
// 	console.error('caught error while coping config!');
// 	throw error;
// }
// // endregion
//
// // region установка дополнительных переменных окружения
// console.log('appending extra variables...');
// try {
// 	fs.appendFileSync(pathToResultConfig, '\n#region extra variables (added in prepareEnvironment)\n');
// } catch (error) {
// 	console.error('caught error while appending extra variable to config!');
// }
//
// allowedArgumentNames.forEach((argumentName) => {
// 	const variableName = configVariablesByArguments[argumentName];
// 	if (!variableName) {
// 		throw new Error(`unknown variable name! argument is ${argumentName}`);
// 	}
//
// 	if (!scriptArguments[argumentName]) {
// 		console.log(`skip ${argumentName} (${variableName}), value is empty`);
// 		return;
// 	}
//
// 	console.log(`appending ${argumentName} (${variableName})...`);
// 	try {
// 		fs.appendFileSync(pathToResultConfig, `${variableName}=${scriptArguments[argumentName]}\n`);
// 	} catch (error) {
// 		console.error('caught error while appending extra variable to config!');
// 		throw error;
// 	}
// });
//
// try {
// 	const buildVersion = scriptArguments[KEY_CAL_VAR];
// 	const releaseName = `${appName}${buildVersion ? `+${buildVersion}` : ''}`;
// 	console.log(`appending REACT_APP_RELEASE_NAME (${releaseName})...`);
// 	fs.appendFileSync(pathToResultConfig, `REACT_APP_RELEASE_NAME=${releaseName}\n`);
//
// 	fs.appendFileSync(pathToResultConfig, '#endregion\n');
// } catch (error) {
// 	console.error('caught error while appending extra variable to config!');
// }
//
// console.log('extra config variables appended!\n');
// // endregion
//
// console.log(`environment ${targetEnvironment} prepared!`);
