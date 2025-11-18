import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'build',
    format: ['cjs', 'esm'],
    platform: 'node',
    target: 'esnext',
    dts: true,
    sourcemap: false,
    clean: true,
    external: ['vite'],
    banner: ({ format }) => {
        if (format !== 'esm') {
            return;
        }

        return {
            js: "import { createRequire } from 'module';const require = createRequire(import.meta.url)"
        };
    }
});
