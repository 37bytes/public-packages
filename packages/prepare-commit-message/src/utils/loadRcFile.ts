import { rcFile } from 'rc-config-loader';

interface LoadRcFileParams {
    rcFileName: string;
    configurationPath?: string;
    packageJsonProperty?: string;
}
export const loadRcFile = <T>({ rcFileName, configurationPath, packageJsonProperty }: LoadRcFileParams) =>
    rcFile<T>(rcFileName, {
        configFileName: configurationPath,
        packageJSON: { fieldName: packageJsonProperty }
    });
