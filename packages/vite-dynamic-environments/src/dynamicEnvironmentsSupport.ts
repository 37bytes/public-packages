// noinspection HtmlRequiredTitleElement

import { readFileSync, readdirSync, statSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import { Plugin } from 'vite';

interface GetDevelopmentDynamicEnvironmentParams {
    path: string;
    ignorePrefixes?: string[];
}

// todo отдельная функция плюс тесты
const getLast = <T>(array: T[]): T => array[array.length - 1];

// todo отдельная функция плюс тесты
const getDynamicEnvironment = ({ path, ignorePrefixes }: GetDevelopmentDynamicEnvironmentParams) => {
    const config = dotenv.parse(readFileSync(path));

    // noinspection UnnecessaryLocalVariableJS
    const dynamicEnvironment = Object.fromEntries(
        Object.entries(config).filter(([key]) => !ignorePrefixes.some((prefix) => key.startsWith(prefix)))
    );

    return dynamicEnvironment;
};

// todo отдельная функция плюс тесты
const generateScript = (environment: object) => `
  window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});
`;

const DEFAULT_SCRIPT_LINK = '/dynamicEnvironment.js';
const DEFAULT_DYNAMIC_ENVIRONMENTS_DIR = resolve(process.cwd(), 'environments/dynamic');
const DEFAULT_OUTPUT_DIR = resolve(process.cwd(), 'build-env');

interface Params {
    scriptLink?: string;
    ignorePrefixes?: string[];
    dynamicEnvironmentsDir?: string;
    outputDir?: string;
}

// todo каждый обработчик в отдельный файл
const dynamicEnvironmentsSupport = ({
    scriptLink = DEFAULT_SCRIPT_LINK,
    ignorePrefixes = ['VITE_'],
    dynamicEnvironmentsDir = DEFAULT_DYNAMIC_ENVIRONMENTS_DIR,
    outputDir = DEFAULT_OUTPUT_DIR
}: Params = {}): Plugin => ({
    name: '@37bytes/vite-dynamic-environments',
    // режим разработки
    configureServer(server) {
        server.middlewares.use(scriptLink, (request, response) => {
            // генерирует ответ каждый запрос для поддержки динамического обновления
            const dynamicEnvironment = getDynamicEnvironment({
                ignorePrefixes,
                path: resolve(process.cwd(), '.env.development')
            });

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(generateScript(dynamicEnvironment));
        });
    },
    // очистка outputDir
    buildStart: () => {
        rmSync(outputDir, { recursive: true, force: true });
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

            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
            }

            writeFileSync(
                join(outputDir, `dynamicEnvironment.${environmentName}.js`),
                generateScript(dynamicEnvironment)
            );
        });
    },
    // автоматическое добавление скрипта в html
    transformIndexHtml: (html) => {
        if (!html.includes('<head>')) {
            throw new Error("dynamicEnvironmentsPlugin: '<head>' not found in html");
        }

        return html.replace('<head>', `<head><script src="${scriptLink}"></script>`);
    }
});

export default dynamicEnvironmentsSupport;
