import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    outDir: 'build',
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    ignoreWatch: ['__tests__/**', '**/*.test.ts', 'vitest.config.ts']
});
