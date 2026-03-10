import { defineConfig } from 'tsdown';

/**
 * Пресет сборки для Node.js-пакетов.
 * Генерирует ESM + CJS с декларациями типов, без sourcemap.
 */
export const defineNodeConfig = () =>
    defineConfig({
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        clean: true,
        outDir: 'build',
        sourcemap: false,
        publint: { strict: true }
    });
