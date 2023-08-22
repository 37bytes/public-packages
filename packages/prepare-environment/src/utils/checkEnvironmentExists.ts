import fs from 'fs';

const checkEnvironmentExists = (targetEnvironment, pathToEnvironmentsFolder) => {
    // Получаем все env-файлы из папки с окружениями
    const files = fs.readdirSync(pathToEnvironmentsFolder);

    console.log(`environments found in environments folder ${files}`);

    // Проверяем есть ли среди них нужный
    return files.some((environment) => {
        return environment.endsWith(`.${targetEnvironment}`);
    });
};

export default checkEnvironmentExists;
