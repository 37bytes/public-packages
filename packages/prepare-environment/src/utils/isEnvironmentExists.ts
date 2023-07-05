import fs from 'fs';

const isEnvironmentExists = (targetEnvironment, pathToEnvironmentsFolder) => {
    // Получаем все env-файлы из папки с окружениями
    const files = fs.readdirSync(pathToEnvironmentsFolder);

    // Проверяем есть ли среди них нужный
    return files.some((environment) => {
        return environment.startsWith('.env.') && environment.endsWith(targetEnvironment);
    });
};

export default isEnvironmentExists;
