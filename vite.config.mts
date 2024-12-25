/// <reference types="vitest" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    cacheDir: './node_modules/.vite/shaders',

    server: {
        port: 4200,
        host: 'localhost',
    },

    preview: {
        port: 4300,
        host: 'localhost',
    },

    plugins: [
        react(),
        glsl(),
        viteTsConfigPaths({
            root: './',
        }),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: './',
    //    }),
    //  ],
    // },

    test: {
        globals: true,
        cache: {
            dir: './node_modules/.vitest',
        },
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
