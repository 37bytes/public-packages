// import dotenv from "dotenv";
import { readFileSync } from 'node:fs';

const dotenv = require('dotenv');

interface GetDevelopmentDynamicEnvironmentParams {
    path: string;
    ignorePrefixes?: string[];
}

// возвращает объект с переменными окружения из файла,
// игнорируя те, которые начинаются с указанных префиксов
const getDynamicEnvironment = ({ path, ignorePrefixes = [] }: GetDevelopmentDynamicEnvironmentParams) => {
    const config = dotenv.parse(readFileSync(path));

    // noinspection UnnecessaryLocalVariableJS
    const dynamicEnvironment = Object.fromEntries(
        Object.entries(config).filter(([key]) => !ignorePrefixes.some((prefix) => key.startsWith(prefix)))
    );

    return dynamicEnvironment;
};

export default getDynamicEnvironment;
