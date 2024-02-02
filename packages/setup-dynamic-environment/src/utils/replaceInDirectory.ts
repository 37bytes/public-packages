import fs from 'fs';
import path from 'path';
import replaceInFile from './replaceInFile';

function replaceInDirectory(directory: string, dynamicEnvironment: object) {
    fs.readdirSync(directory).forEach((file) => {
        const fullPath = path.join(directory, file);

        if (fs.statSync(fullPath).isDirectory()) {
            // Если это директория, рекурсивно обходить ее
            replaceInDirectory(fullPath, dynamicEnvironment);
        } else if (path.extname(file) === '.js') {
            // Если это JS-файл, заменить в нем строки
            console.log('calling replaceInFile...', fullPath);
            replaceInFile(fullPath, dynamicEnvironment);
        }
    });
}

export default replaceInDirectory;
