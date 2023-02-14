import { rcFile } from 'rc-config-loader';

interface LoadRcFileParams {
    rcFileName: string;
    configurationPath?: string;
}
export const loadRcFile = <T>({ rcFileName, configurationPath }: LoadRcFileParams) => {
    const configData = rcFile<T>(rcFileName, {
        configFileName: configurationPath
    });
    if (Object.keys(configData.config).length === 0) {
        throw Error(`config not found by filePath${configData.filePath} or it's an empty`);
    } else {
        return configData;
    }
};
