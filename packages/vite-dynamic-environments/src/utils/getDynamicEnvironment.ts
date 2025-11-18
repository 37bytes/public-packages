import { existsSync, readFileSync } from 'node:fs';
import * as dotenv from 'dotenv';

interface GetDevelopmentDynamicEnvironmentParams {
    path: string;
    ignorePrefixes?: string[];
}

export const getDynamicEnvironment = ({ path, ignorePrefixes = [] }: GetDevelopmentDynamicEnvironmentParams) => {
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
