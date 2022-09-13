import SentryCli from '@sentry/cli';

interface UploadReleaseParams {
    cli: SentryCli;
    releaseName: string;
    releaseDirectory: string;
}

const uploadRelease = async ({ cli, releaseName, releaseDirectory }: UploadReleaseParams) => {
    console.log('uploadRelease', { releaseName, releaseDirectory });
    console.log('uploadRelease: creating sentry release... ');
    await cli.releases.new(releaseName);
    console.log('uploadRelease: uploading source maps...');
    await cli.releases.uploadSourceMaps(releaseName, {
        include: [`${releaseDirectory}/static/js`],
        urlPrefix: '~/static/js',
        rewrite: false
    });
    console.log('uploadRelease: finalizing release...');
    await cli.releases.finalize(releaseName);
};

export default uploadRelease;
