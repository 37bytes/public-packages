import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import getLast from '../utils/getLast';
import getDynamicEnvironment from '../utils/getDynamicEnvironment';
import generateScript from '../utils/generateScript';

export const handleBuildStart = ({ envOutputDir }) => {
    rmSync(envOutputDir, { recursive: true, force: true });
};

export const handleBuildEnd = ({
    dynamicEnvironmentsDir,
    ignorePrefixes,
    envOutputDir,
    FORCE_ENVIRONMENT,
    logger,
    forceEnvironmentScriptContent
}) => {
    const fullPathToDynamicEnvironments = resolve(process.cwd(), dynamicEnvironmentsDir);
    readdirSync(fullPathToDynamicEnvironments).forEach((fileName) => {
        if (!fileName.startsWith('.env.')) {
            return;
        }

        const fullPathToFile = join(fullPathToDynamicEnvironments, fileName);
        if (statSync(fullPathToFile).isDirectory()) {
            return;
        }

        const environmentName = getLast(fileName.split('.'));
        const dynamicEnvironment = getDynamicEnvironment({
            ignorePrefixes,
            path: fullPathToFile
        });

        if (!existsSync(envOutputDir)) {
            mkdirSync(envOutputDir, { recursive: true });
        }

        const scriptContent = generateScript(dynamicEnvironment);

        writeFileSync(join(envOutputDir, `dynamicEnvironment.${environmentName}.js`), scriptContent);
        if (FORCE_ENVIRONMENT === environmentName) {
            logger.info(
                `process.env.FORCE_ENVIRONMENT defined! preparing dynamicEnvironment.js for "${environmentName}"...`
            );
            forceEnvironmentScriptContent = scriptContent;
        }
    });
};
