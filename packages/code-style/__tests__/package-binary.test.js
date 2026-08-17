import { executePackageBinary, executePackageBinarySync, resolvePackageBinary } from '#tests/package-binary';

import assert from 'node:assert';
import path from 'node:path';
import { describe, test } from 'node:test';

describe('package binary launcher', () => {
    test('should resolve the package bin entry instead of a node_modules/.bin shim — catches Windows ENOENT', () => {
        const binaryPath = resolvePackageBinary('oxlint', 'oxlint');

        assert.strictEqual(path.basename(path.dirname(binaryPath)), 'bin');
        assert.strictEqual(path.basename(binaryPath), 'oxlint');
        assert.ok(!binaryPath.includes(`${path.sep}.bin${path.sep}`));
    });
    test('should resolve a binary when package.json is not exported', () => {
        const binaryPath = resolvePackageBinary('dependency-cruiser', 'depcruise');

        assert.strictEqual(path.basename(binaryPath), 'dependency-cruise.mjs');
        assert.ok(!binaryPath.includes(`${path.sep}.bin${path.sep}`));
    });
    test('should execute a package bin through the current Node executable — catches shebang-dependent launches', async () => {
        const { stdout } = await executePackageBinary('oxlint', 'oxlint', ['--version']);

        assert.strictEqual(stdout.trim(), 'Version: 1.73.0');
    });
    test('should execute a package bin synchronously through the current Node executable — catches build-script Windows ENOENT', () => {
        const stdout = executePackageBinarySync('oxlint', 'oxlint', ['--version'], { encoding: 'utf8' });

        assert.strictEqual(stdout.trim(), 'Version: 1.73.0');
    });
    test('should preserve the original resolution error when a package is missing — catches misleading JSON parse errors', async () => {
        await assert.rejects(
            executePackageBinary('@37bytes/package-that-does-not-exist', 'missing', []),
            (error) => error.code === 'MODULE_NOT_FOUND'
        );
    });
});
