import { resolve } from 'node:path';

export const handleConfig = ({ config, nextEnvConfig, envConfig, envDir, outDir }) => {
    // https://vitejs.dev/config/build-options.html#build-outdir
    outDir = config.build?.outDir ?? 'dist';
    envConfig = nextEnvConfig;
    if (config.envDir) {
        envDir = resolve(process.cwd(), config.envDir);
    } else {
        envDir = process.cwd();
    }
};
