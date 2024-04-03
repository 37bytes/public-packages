// noinspection HtmlRequiredTitleElement

import { readFileSync, readdirSync, statSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import { ConfigEnv, createLogger, Plugin } from 'vite';

const logger = createLogger('info', { prefix: '[dynamicEnvironmentsSupport]' });

const { FORCE_ENVIRONMENT } = process.env;

interface GetDevelopmentDynamicEnvironmentParams {
    path: string;
    ignorePrefixes?: string[];
}

// todo отдельная функция плюс тесты
const getLast = <T>(array: T[]): T => array[array.length - 1];

// todo отдельная функция плюс тесты
const getDynamicEnvironment = ({ path, ignorePrefixes = [] }: GetDevelopmentDynamicEnvironmentParams) => {
    if (!existsSync(path)) {
        throw new Error(`File does not exist (${path})`);
    }

    const config = dotenv.parse(readFileSync(path));

    // noinspection UnnecessaryLocalVariableJS
    const dynamicEnvironment = Object.fromEntries(
        Object.entries(config).filter(([key]) => !ignorePrefixes.some((prefix) => key.startsWith(prefix)))
    );

    return dynamicEnvironment;
};

// todo отдельная функция плюс тесты
const generateScript = (environment: object) =>
    `window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});`;

const DEFAULT_SCRIPT_LINK = '/dynamicEnvironment.js';
const DEFAULT_DYNAMIC_ENVIRONMENTS_DIR = resolve(process.cwd(), 'environments/dynamic');
const DEFAULT_OUTPUT_DIR = resolve(process.cwd(), 'build-env');

interface Params {
    scriptLink?: string;
    ignorePrefixes?: string[];
    dynamicEnvironmentsDir?: string;
    envOutputDir?: string;
}

// todo каждый обработчик в отдельный файл
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
            // https://vitejs.dev/config/build-options.html#build-outdir
            outDir = config.build?.outDir ?? 'dist';
            envConfig = nextEnvConfig;
            if (config.envDir) {
                envDir = resolve(process.cwd(), config.envDir);
            } else {
                envDir = process.cwd();
            }
        },
        // режим разработки
        configureServer(server) {
            server.middlewares.use(scriptLink, (request, response) => {
                if (!envDir) {
                    throw new Error('envDir is falsy');
                }

                // генерирует ответ каждый запрос для поддержки динамического обновления
                const dynamicEnvironment = getDynamicEnvironment({
                    ignorePrefixes,
                    path: resolve(envDir, `.env.${envConfig.mode}`)
                });

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(generateScript(dynamicEnvironment));
            });
        },
        // очистка outputDir
        buildStart: () => {
            rmSync(envOutputDir, { recursive: true, force: true });
        },
        // генерация .js для каждого динамического окружения
        buildEnd: () => {
            const fullPathToDynamicEnvironments = resolve(process.cwd(), dynamicEnvironmentsDir);
            readdirSync(fullPathToDynamicEnvironments).forEach((fileName) => {
                if (!fileName.startsWith('.env.')) {
                    return;
                }

                const fullPathToFile = join(fullPathToDynamicEnvironments, fileName);
                if (statSync(fullPathToFile).isDirectory()) {
                    return;
                }

                const environmentName = getLast(fileName.split('.'));
                const dynamicEnvironment = getDynamicEnvironment({
                    ignorePrefixes,
                    path: fullPathToFile
                });

                if (!existsSync(envOutputDir)) {
                    mkdirSync(envOutputDir, { recursive: true });
                }

                const scriptContent = generateScript(dynamicEnvironment);

                writeFileSync(join(envOutputDir, `dynamicEnvironment.${environmentName}.js`), scriptContent);
                if (FORCE_ENVIRONMENT === environmentName) {
                    logger.info(
                        `process.env.FORCE_ENVIRONMENT defined! preparing dynamicEnvironment.js for "${environmentName}"...`
                    );
                    forceEnvironmentScriptContent = scriptContent;
                }
            });
        },
        // автоматическое добавление скрипта в html
        transformIndexHtml: (html) => {
            if (!html.includes('<head>')) {
                throw new Error("dynamicEnvironmentsPlugin: '<head>' not found in html");
            }

            return html.replace('<head>', `<head><script src='${scriptLink}'></script>`);
        },
        writeBundle: () => {
            if (forceEnvironmentScriptContent) {
                logger.info(`writing prepared dynamicEnvironment.js in "${outDir}"...`);
                writeFileSync(join(resolve(outDir, 'dynamicEnvironment.js')), forceEnvironmentScriptContent);
            }
        }
    };
};

export default dynamicEnvironmentsSupport;
