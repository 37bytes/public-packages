import { resolve } from 'path';
import { existsSync } from 'fs';
import { config } from 'dotenv';

interface ExtractReleaseNameParams {
    configName: string;
    variableName: string;
}

const extractReleaseName = ({ configName, variableName }: ExtractReleaseNameParams): string => {
    console.debug('extractReleaseName called', { configName, variableName });
    const configPath = resolve(process.cwd(), `./${configName}`);
    console.debug(`extractReleaseName: target app .env config path: ${configPath}`);
    if (!existsSync(configPath)) {
        throw new Error(`extractReleaseName: "${configPath}" does not exists`);
    }
    config({ path: configPath });
    const releaseName = process.env[variableName];
    if (!releaseName) {
        throw new Error(`extractReleaseName: ${variableName} is empty`);
    }

    return releaseName;
};

export default extractReleaseName;
