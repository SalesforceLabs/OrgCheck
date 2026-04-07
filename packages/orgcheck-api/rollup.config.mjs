import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

export default [
    {
        input: './src/orgcheck.ts',
        plugins: [
            resolve({ preferBuiltins: false, extensions: ['.js', '.ts'] }),
            typescript({ tsconfig: './tsconfig.build.json' }),
            commonjs({ extensions: ['.js', '.ts'] })
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