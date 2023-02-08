const fs = require('fs');
const path = require('path');
import ProcessArgument, { ExtractedArguments } from './constants/ProcessArgument';

interface PrepareEnvironmentParams {
    configData: {
        environmentsFolder: string;
        resultConfig: string;
        allowedEnvironments: string[];
        variablePrefix: string;
    };
    cliArguments: ExtractedArguments;
    appName: string;
}
const prepareEnvironment = ({ configData, cliArguments, appName }: PrepareEnvironmentParams) => {
    const { variablePrefix, allowedEnvironments, environmentsFolder, resultConfig } = configData;

    // region константы
    const pathToResultConfig = path.resolve(__dirname, resultConfig);
    const pathToEnvironmentsFolder = path.resolve(__dirname, environmentsFolder);
    console.log({ pathToResultConfig, pathToEnvironmentsFolder });
    // endregion

    // region вспомогательные функции
    const getPathToSourceConfig = (targetEnvironment) => `${pathToEnvironmentsFolder}/.env.${targetEnvironment}`;
    // endregion

    // region аргументы командной строки
    const KEY_ENV_NAME = 'ENV_NAME';
    const KEY_CAL_VAR = 'CAL_VER';
    const KEY_COMMIT_SHORT_SHA = 'COMMIT_SHORT_SHA';
    const KEY_REF_NAME = 'REF_NAME';

    const allowedArgumentNames = [KEY_ENV_NAME, KEY_CAL_VAR, KEY_COMMIT_SHORT_SHA, KEY_REF_NAME];
    const requiredArgumentNames = [KEY_ENV_NAME];

    const configVariablesByArguments = {
        [KEY_ENV_NAME]: `${variablePrefix}ENV_NAME`,
        [KEY_CAL_VAR]: `${variablePrefix}CAL_VER`,
        [KEY_COMMIT_SHORT_SHA]: `${variablePrefix}SHORT_SHA`,
        [KEY_REF_NAME]: `${variablePrefix}REF_NAME`
    };
    // endregion

    console.log('preparing environment...\n');

    // region сбор значимых параметров запуска в объект
    console.log(`building arguments by allowedArgumentNames ([${allowedArgumentNames}])...`);
    const scriptArguments = Object.entries(cliArguments)
        .filter(([key]) => key !== ProcessArgument.CONFIG_PATH)
        .reduce((acc, item) => {
            const [key, value] = item;
            acc[key] = value;
            return acc;
        }, {});
    console.log(JSON.stringify(scriptArguments));
    console.log('arguments built!\n');
    // endregion

    // region валидация
    console.log('validating required arguments...');
    console.log(`required arguments is [${requiredArgumentNames}]`);
    const emptyRequiredArguments =
        Object.keys(scriptArguments).length === 0
            ? requiredArgumentNames
            : Object.keys(scriptArguments).filter(
                  (argumentName) => requiredArgumentNames.includes(argumentName) && !scriptArguments[argumentName]
              );
    if (emptyRequiredArguments.length > 0) {
        throw new Error(
            `Script arguments validation failed! Required arguments is missed ([${emptyRequiredArguments.toString()}]) `
        );
    }
    console.log('validation passed!\n');
    // endregion

    // region поиск подходящего env-файла
    console.log('finding config...');
    const targetEnvironment = scriptArguments[KEY_ENV_NAME];
    if (!targetEnvironment || !allowedEnvironments.includes(targetEnvironment)) {
        throw new Error(
            `targetEnvironment unknown, current value is "${targetEnvironment}", available values is [${allowedEnvironments}]`
        );
    }
    console.log(`target environment found! ${targetEnvironment}`);
    const pathToSourceConfig = getPathToSourceConfig(targetEnvironment);
    console.log(`path to source config is "${pathToSourceConfig}"`);

    if (!fs.existsSync(pathToSourceConfig)) {
        throw new Error(`source config not found!`);
    }
    console.log('source config exists!\n');
    // endregion

    // region копирование env-файла
    console.log(`coping source config to ${pathToResultConfig}...`);
    try {
        fs.copyFileSync(pathToSourceConfig, pathToResultConfig);
        console.log(`config copied!\n`);
    } catch (error) {
        console.error('caught error while coping config!');
        throw error;
    }
    // endregion

    // region установка дополнительных переменных окружения
    console.log('appending extra variables...');
    try {
        fs.appendFileSync(pathToResultConfig, '\n#region extra variables (added in prepareEnvironment)\n');
    } catch (error) {
        console.error('caught error while appending extra variable to config!');
    }

    allowedArgumentNames.forEach((argumentName) => {
        const variableName = configVariablesByArguments[argumentName];
        if (!variableName) {
            throw new Error(`unknown variable name! argument is ${argumentName}`);
        }

        if (!scriptArguments[argumentName]) {
            console.log(`skip ${argumentName} (${variableName}), value is empty`);
            return;
        }

        console.log(`appending ${argumentName} (${variableName})...`);
        try {
            fs.appendFileSync(pathToResultConfig, `${variableName}=${scriptArguments[argumentName]}\n`);
        } catch (error) {
            console.error('caught error while appending extra variable to config!');
            throw error;
        }
    });

    try {
        const buildVersion = scriptArguments[KEY_CAL_VAR];
        const releaseName = `${appName}${buildVersion ? `+${buildVersion}` : ''}`;
        console.log(`appending ${variablePrefix}RELEASE_NAME (${releaseName})...`);
        fs.appendFileSync(pathToResultConfig, `${variablePrefix}RELEASE_NAME=${releaseName}\n`);

        fs.appendFileSync(pathToResultConfig, '#endregion\n');
    } catch (error) {
        console.error('caught error while appending extra variable to config!');
    }

    console.log('extra config variables appended!\n');
    // endregion

    console.log(`environment ${targetEnvironment} prepared!`);
};

export default prepareEnvironment;
