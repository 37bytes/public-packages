import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { name } from './package.json';

const [, libraryName] = name.split('/');

export default defineConfig({
    plugins: [dts({insertTypesEntry: true, exclude: ["vite.config.mts"]})],
    build: {
        outDir: "build",
        lib: {
            entry: resolve(process.cwd(), 'src/index.ts'),
            name: libraryName,
            fileName: (format) => `${libraryName}.${format}.js`
        }
    }
});
