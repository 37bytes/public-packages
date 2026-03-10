#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import proxyRequest from 'request';
import extractLaunchArguments from './utils/extractLaunchArguments';

const { name: packageName, version: packageVersion } = require('../package.json');

// region launch args
const { PORT: sourcePort = 9000, PROXY_MODE = 'json', PATH_TO_CONFIG = '.env.proxy' } = extractLaunchArguments();
const PORT = Number(sourcePort as string);

if (typeof PORT !== 'number' || isNaN(PORT)) {
    throw new Error(`PORT is not a number (${PORT})`);
}
if (typeof PROXY_MODE !== 'string') {
    throw new Error(`PROXY_MODE is not a string (${PROXY_MODE})`);
}
if (!['json', 'file'].includes(PROXY_MODE)) {
    throw new Error(`Unknown PROXY_MODE (${PROXY_MODE})`);
}
if (typeof PATH_TO_CONFIG !== 'string') {
    throw new Error(`PATH_TO_CONFIG is not a string (${PATH_TO_CONFIG})`);
}
// endregion

// region .env
const resolvedPathToConfig = path.resolve(process.cwd(), PATH_TO_CONFIG);
if (!fs.existsSync(resolvedPathToConfig)) {
    console.log(`
---    
config example:

  API_HOST=https://example.com/api
  COOKIE=demo=1;debug=test

---    
    `);
    throw new Error(`.env config not found (${PATH_TO_CONFIG})`);
}
dotenv.config({ path: resolvedPathToConfig });
const { API_HOST, COOKIE } = process.env;
if (!API_HOST) {
    throw new Error('API_HOST is empty');
}
if (!COOKIE) {
    throw new Error('COOKIES is empty');
}
const cookieNames = COOKIE.split(';').reduce<string[]>((result, item) => {
    const [name] = item.split('=');
    result.push(name);
    return result;
}, []);
// region

const app = express();
const server = http.createServer(app);
app.use(cookieParser());

app.use('/', function (request, response) {
    console.log(`handle "${request.method} ${request.url}"`);
    let result;

    const method = request.method.toLowerCase().replace(/delete/, 'del');
    response.setHeader('Access-Control-Allow-Origin', request.headers.origin || request.ip);
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, authorization');
    // @ts-ignore
    response.setHeader('Access-Control-Allow-Credentials', true);

    switch (method) {
        case 'options':
            return response.send();
        case 'get':
        case 'post':
        case 'del':
        case 'put':
            result = proxyRequest[method]({
                uri: process.env.API_HOST + request.url,
                json: PROXY_MODE === 'json' ? request.body : undefined,
                data: PROXY_MODE === 'file' ? request.body : undefined,
                jar: true,
                headers: {
                    Cookie: COOKIE,
                    ContentType:
                        PROXY_MODE === 'file' ? request.headers['ContentType'] || 'multipart/form-data' : undefined
                }
            });
            break;
        default:
            return response.send('invalid method');
    }

    result.on('error', (error) => {
        console.log(`caught error while processing "${request.method} ${request.url}"`, error);
    });

    return request.pipe(result).pipe(response);
});

server.listen(PORT, () => {
    console.log(`${packageName} v. ${packageVersion} listening on port ${PORT}`);
    console.log(`Config: ${resolvedPathToConfig}`);
    console.log(`API_HOST: ${API_HOST}`);
    console.log(`PROXY_MODE: ${PROXY_MODE}`);
    console.log(`Cookie names: [${cookieNames}]`);
});
