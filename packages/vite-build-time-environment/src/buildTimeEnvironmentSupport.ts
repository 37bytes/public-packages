import { Plugin } from 'vite';

interface Aliases {
    VERSION_FIELD_NAME?: string;
    BRANCH_FIELD_NAME?: string;
    COMMIT_HASH_FIELD_NAME?: string;
}

interface Params {
    packageName: string;
    packageVersion: string;
    aliases?: Aliases;
}

const buildTimeIdentifiersPlugin = ({ packageName, packageVersion, aliases }: Params): Plugin => {
    if (!packageName) {
        throw new Error('packageName cannot be falsy');
    }

    if (!packageVersion) {
        throw new Error('packageVersion cannot be falsy');
    }

    return {
        name: '@37bytes/vite-build-time-environment',
        config(config) {
            const version = process.env[aliases?.VERSION_FIELD_NAME ?? 'VERSION'];
            const branch = process.env[aliases?.BRANCH_FIELD_NAME ?? 'BRANCH'] || '[unknown git branch]';
            const commitHash = process.env[aliases?.COMMIT_HASH_FIELD_NAME ?? 'COMMIT_HASH'] || '[unknown commit hash]';

            const releaseName = `${packageName}@${packageVersion}${version ? `+${version}` : ''}`;

            config.define = {
                ...config.define,

                PACKAGE_INFO_FIELD_NAME: JSON.stringify(packageName),
                PACKAGE_INFO_FIELD_VERSION: JSON.stringify(packageVersion),

                BUILD_TIME_VARIABLES_VERSION: JSON.stringify(version || '[unknown build version]'),
                BUILD_TIME_VARIABLES_BRANCH: JSON.stringify(branch),
                BUILD_TIME_VARIABLES_COMMIT_HASH: JSON.stringify(commitHash),

                BUILD_TIME_VARIABLES_RELEASE_NAME: JSON.stringify(releaseName)
            };
        }
    };
};

export default buildTimeIdentifiersPlugin;
