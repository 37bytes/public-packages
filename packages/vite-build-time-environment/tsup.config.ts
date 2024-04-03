import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/buildTimeEnvironmentSupport.ts'],
    outDir: 'build',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    clean: true
});
