import { resolve } from 'node:path';
import { ConfigEnv, createLogger, Plugin } from 'vite';
import createRequestHandler from './handlers/requestHandler';
import { handleBuildEnd, handleBuildStart } from './handlers/buildHandlers';
import { handleTransformIndexHtml } from './handlers/htmlHandler';
import { handleConfig } from './handlers/configHandler';
import { handleWriteBundle } from './handlers/bundleHandler';

const logger = createLogger('info', { prefix: '[dynamicEnvironmentsSupport]' });
const { FORCE_ENVIRONMENT } = process.env;

const DEFAULT_SCRIPT_LINK = '/dynamicEnvironment.js';
const DEFAULT_DYNAMIC_ENVIRONMENTS_DIR = resolve(process.cwd(), 'environments/dynamic');
const DEFAULT_OUTPUT_DIR = resolve(process.cwd(), 'build-env');

export interface Params {
    scriptLink?: string;
    ignorePrefixes?: string[];
    dynamicEnvironmentsDir?: string;
    envOutputDir?: string;
}

const dynamicEnvironmentsSupport = ({
    scriptLink = DEFAULT_SCRIPT_LINK,
    ignorePrefixes = ['VITE_'],
    dynamicEnvironmentsDir = DEFAULT_DYNAMIC_ENVIRONMENTS_DIR,
    envOutputDir = DEFAULT_OUTPUT_DIR
}: Params = {}): Plugin => {
    // директория с собранным проектом
    let outDir;
    // директория с .env-файлами
    let envDir;
    let envConfig: ConfigEnv;

    let forceEnvironmentScriptContent: string;

    return {
        name: '@37bytes/vite-dynamic-environments',
        config: (config, nextEnvConfig) => {
            handleConfig({ nextEnvConfig, envConfig, envDir, config, outDir });
        },
        // режим разработки
        configureServer(server) {
            server.middlewares.use(scriptLink, createRequestHandler({ ignorePrefixes, envConfig, envDir }));
        },
        // очистка outputDir
        buildStart: () => {
            handleBuildStart({ envOutputDir });
        },
        // генерация .js для каждого динамического окружения
        buildEnd: () => {
            handleBuildEnd({
                envOutputDir,
                dynamicEnvironmentsDir,
                FORCE_ENVIRONMENT,
                forceEnvironmentScriptContent,
                ignorePrefixes,
                logger
            });
        },
        // автоматическое добавление скрипта в html
        transformIndexHtml: (html) => {
            handleTransformIndexHtml({ html, scriptLink });
        },
        writeBundle: () => {
            handleWriteBundle({ forceEnvironmentScriptContent, logger, outDir });
        }
    };
};

export default dynamicEnvironmentsSupport;
