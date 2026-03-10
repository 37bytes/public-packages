import SentryCli from '@sentry/cli';

interface UploadReleaseParams {
    cli: SentryCli;
    releaseName: string;
    releaseDirectory: string;
    staticDirectory: string;
}

const uploadRelease = async ({ cli, releaseName, releaseDirectory, staticDirectory }: UploadReleaseParams) => {
    if (staticDirectory === '.') {
        console.log('uploadRelease: ignoring static directory...');
        staticDirectory = undefined;
    }

    console.log('uploadRelease', { releaseName, releaseDirectory, staticDirectory });
    console.log('uploadRelease: creating sentry release... ');
    await cli.releases.new(releaseName);
    console.log('uploadRelease: uploading source maps...');

    await cli.releases.uploadSourceMaps(releaseName, {
        include: [[releaseDirectory, staticDirectory].filter(Boolean).join('/')],
        urlPrefix: ['~', staticDirectory].filter(Boolean).join('/'),
        rewrite: false
    });
    console.log('uploadRelease: finalizing release...');
    await cli.releases.finalize(releaseName);
};

export default uploadRelease;
