import { rcFile } from 'rc-config-loader';

interface GetPackagePropertyParams {
    packageJsonProperty: string;
}
export const getPackageProperty = ({ packageJsonProperty }: GetPackagePropertyParams) => {
    return rcFile('package.json', {
        packageJSON: { fieldName: packageJsonProperty }
    });
};
