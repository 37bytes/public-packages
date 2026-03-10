import { process } from 'node:process';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const hooksPath = `${gitRoot}/.gitHooks`;

if (!existsSync(hooksPath)) {
    console.error(`Error: directory ${hooksPath} does not exist.`);
    process.exit(1);
}

const currentHooksPath = execSync('git config core.hooksPath || echo ""').toString().trim();

if (currentHooksPath === hooksPath) {
    console.log(`core.hooksPath already set to ${hooksPath}`);
    process.exit(0);
}

console.log(`Setting core.hooksPath to: "${hooksPath}"`);
execSync(`git config core.hooksPath ${hooksPath}`);
console.log('Done!');
