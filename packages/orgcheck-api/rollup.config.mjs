import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import { dts } from 'rollup-plugin-dts';

const root = dirname(fileURLToPath(import.meta.url));

function tsconfigPaths() {
    return {
        name: 'tsconfig-paths',
        resolveId(id) {
            if (!id.startsWith('src/') && !id.startsWith('tests/')) return null;
            const base = resolve(root, id);
            for (const ext of ['', '.ts', '.js']) {
                const candidate = ext ? `${base}${ext}` : base;
                if (existsSync(candidate)) return candidate;
            }
            return null;
        }
    };
}

export default [
    {
        input: './src/orgcheck.ts',
        plugins: [
            tsconfigPaths(),
            nodeResolve({ preferBuiltins: false, extensions: ['.js', '.ts'] }),
            esbuild({
                tsconfig: './tsconfig.build.json',
                target: 'es2015',
                sourceMap: false
            }),
            commonjs({ extensions: ['.js', '.ts'] })
        ],
        output: {
            file: './dist/orgcheck.js',
            format: 'umd',
            name: 'orgcheck',
            extend: true,
            plugins: [ terser({ maxWorkers: 1 }) ]
        }
    },
    {
        input: './src/orgcheck.ts',
        output: { file: './dist/orgcheck.d.ts', format: 'es' },
        plugins: [
            dts({
                tsconfig: './tsconfig.build.json',
                compilerOptions: { 
                    paths: { 
                        'src/*': ['./src/*'], 
                        'tslib': ['./node_modules/tslib/tslib.d.ts'] 
                    } 
                }
            })
        ]
    }
];
