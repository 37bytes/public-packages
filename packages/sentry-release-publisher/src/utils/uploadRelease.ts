import SentryCli from '@sentry/cli';

interface UploadReleaseParams {
    cli: SentryCli;
    releaseName: string;
    releaseDirectory: string;
    staticDirectory: string;
}

const uploadRelease = async ({ cli, releaseName, releaseDirectory, staticDirectory }: UploadReleaseParams) => {
    console.log('uploadRelease', { releaseName, releaseDirectory, staticDirectory });
    console.log('uploadRelease: creating sentry release... ');
    await cli.releases.new(releaseName);
    console.log('uploadRelease: uploading source maps...');
    await cli.releases.uploadSourceMaps(releaseName, {
        include: [`${releaseDirectory}/${staticDirectory}`],
        urlPrefix: `~/${staticDirectory}`,
        rewrite: false
    });
    console.log('uploadRelease: finalizing release...');
    await cli.releases.finalize(releaseName);
};

export default uploadRelease;
