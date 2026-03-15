import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

export default [
    {
        input: './src/orgcheck.ts',
        plugins: [
            resolve({ preferBuiltins: false }),
            commonjs(),
            typescript()
        ],
        output: {
            file: './dist/orgcheck.js',
            format: 'umd',
            name: 'orgcheck',
            extend: true,
            plugins: [ terser() ]
        }
    },
    {
        input: './src/orgcheck.ts',
        output: { file: './dist/orgcheck.d.ts', format: 'es' },
        plugins: [
            dts({
                tsconfig: './tsconfig.json',
                compilerOptions: { 
                    baseUrl: '.', 
                    paths: { 
                        'src/*': ['./src/*'], 
                        'tslib': ['./node_modules/tslib/tslib.d.ts'] 
                    } 
                }
            })
        ]
    }
];