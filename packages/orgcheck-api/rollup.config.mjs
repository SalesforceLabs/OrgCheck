import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: './src/api/orgcheck-api-main.ts',
        plugins: [
            resolve(),
            commonjs(),
            typescript()
        ],
        output: {
            file: './dist/orgcheck-api.js',
            format: 'es',
            name: 'OrgCheckAPI',
            plugins: [
                terser()
            ]
        }
    },
    {
        input: './src/ui/orgcheck-ui-main.ts',
        plugins: [
            resolve(),
            commonjs(),
            typescript()
        ],
        output: {
            file: './dist/orgcheck-ui.js',
            format: 'es',
            name: 'OrgCheckUI',
            plugins: [
                terser()
            ]
        }
    }
];