import { execFile, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { promisify } from 'node:util';

const moduleRequire = createRequire(import.meta.url);
const executeFile = promisify(execFile);
const resolvePackageJsonPath = (packageName) => {
    try {
        return moduleRequire.resolve(`${packageName}/package.json`);
    } catch (resolutionError) {
        if (resolutionError.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
            throw resolutionError;
        }

        for (const modulesDirectory of moduleRequire.resolve.paths(packageName) ?? []) {
            const packageJsonPath = path.join(modulesDirectory, packageName, 'package.json');
            try {
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- path is constrained to Node module search directories and package metadata
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.name === packageName) {
                    return packageJsonPath;
                }
            } catch (readError) {
                if (readError.code !== 'ENOENT') {
                    throw readError;
                }
            }
        }

        throw resolutionError;
    }
};

export const resolvePackageBinary = (packageName, binaryName) => {
    const packageJsonPath = resolvePackageJsonPath(packageName);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- path comes from Node package resolution or the constrained fallback above
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const binaryRelativePath = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin?.[binaryName];

    if (!binaryRelativePath) {
        throw new Error(`Package ${packageName} does not define binary ${binaryName}`);
    }

    return path.resolve(path.dirname(packageJsonPath), binaryRelativePath);
};

export const executePackageBinary = async (packageName, binaryName, binaryArguments, options = {}) =>
    executeFile(process.execPath, [resolvePackageBinary(packageName, binaryName), ...binaryArguments], options);

export const executePackageBinarySync = (packageName, binaryName, binaryArguments, options = {}) =>
    execFileSync(process.execPath, [resolvePackageBinary(packageName, binaryName), ...binaryArguments], options);
