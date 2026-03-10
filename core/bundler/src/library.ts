import { defineConfig } from 'tsdown';

/**
 * Пресет сборки для браузерных библиотек.
 * Генерирует ESM + CJS с декларациями типов и sourcemap.
 */
export const defineLibraryConfig = () =>
    defineConfig({
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        clean: true,
        outDir: 'build',
        sourcemap: true,
        publint: { strict: true }
    });
