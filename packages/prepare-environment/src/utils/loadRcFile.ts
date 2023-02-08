import { rcFile } from 'rc-config-loader';

interface LoadRcFileParams {
    rcFileName: string;
    configurationPath?: string;
    packageJsonProperty?: string;
}
export const loadRcFile = ({ rcFileName, configurationPath, packageJsonProperty }: LoadRcFileParams) =>
    rcFile<{ environmentsFolder: string; resultConfig: string; allowedEnvironments: string[]; variablePrefix: string }>(
        rcFileName,
        {
            configFileName: configurationPath,
            packageJSON: { fieldName: packageJsonProperty }
        }
    );
