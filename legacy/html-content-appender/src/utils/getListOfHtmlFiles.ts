import { readdirSync, statSync, existsSync } from 'fs';
import { resolve, sep } from 'path';

interface GetListOfHtmlFilesParams {
    targetDirectory: string;
}

// https://stackoverflow.com/a/47900452/2973464
const getListOfHtmlFiles = ({ targetDirectory }: GetListOfHtmlFilesParams) => {
    const htmlFiles = [];

    const targetDirectoryPath = resolve(process.cwd(), targetDirectory);
    if (!existsSync(targetDirectoryPath)) {
        throw new Error(`targetDirectory (${targetDirectoryPath}) does not exist`);
    }
    const targetDirectoryStat = statSync(targetDirectoryPath);
    if (!targetDirectoryStat.isDirectory()) {
        throw new Error(`targetDirectory (${targetDirectoryPath}) is not a directory`);
    }

    readdirSync(targetDirectory).forEach((item) => {
        // Obtain absolute path
        const path = resolve(targetDirectory, item);
        // Get stats to determine if path is a directory or a file
        const fileStat = statSync(path);

        if (fileStat.isDirectory()) {
            htmlFiles.push(...getListOfHtmlFiles({ targetDirectory: `${targetDirectory}${sep}${item}` }));
        }

        if (fileStat.isFile() && path.endsWith('.html')) {
            htmlFiles.push(path);
        }
    });

    return htmlFiles;
};

export default getListOfHtmlFiles;
