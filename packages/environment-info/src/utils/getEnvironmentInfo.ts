interface StandInfoParams {
    stand: string;
    version?: string;
    commitHash?: string;
    branch?: string;
    isProduction?: boolean;
}

const getEnvironmentInfo = ({ stand, branch, isProduction, commitHash, version }: StandInfoParams): string => {
    return isProduction ? `${version}` : `${version}|${stand}; ${branch}#${commitHash}`;
};

export default getEnvironmentInfo;
