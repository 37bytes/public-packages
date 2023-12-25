import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/SmartURLSearchParams.ts'],
    outDir: 'build',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true
});
