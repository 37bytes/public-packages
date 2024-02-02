import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const handleWriteBundle = ({ logger, forceEnvironmentScriptContent, outDir }) => {
    if (forceEnvironmentScriptContent) {
        logger.info(`writing prepared dynamicEnvironment.js in "${outDir}"...`);
        writeFileSync(join(resolve(outDir, 'dynamicEnvironment.js')), forceEnvironmentScriptContent);
    }
};
