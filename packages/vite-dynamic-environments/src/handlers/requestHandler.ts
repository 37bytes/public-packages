import getDynamicEnvironment from '../utils/getDynamicEnvironment';
import { resolve } from 'node:path';
import generateScript from '../utils/generateScript';

const createRequestHandler = ({ ignorePrefixes, envConfig, envDir }) => {
    return (request, response) => {
        console.warn('---------------------------');
        console.warn('---------------------------');
        console.warn('---------------------------');
        console.warn('---------------------------');
        console.warn('---------------------------');
        console.warn('---------------------------');

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
    };
};

export default createRequestHandler;
