import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
//import dts from "rollup-plugin-dts";

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
            format: 'umd',           // 'iife' has an issue with the export of the module
            name: 'orgcheck',        // the global variable
            context: 'window',
            extend: true,            // optional – merge with an existing window.orgcheck
            plugins: [ terser() ]
        }
    }
];