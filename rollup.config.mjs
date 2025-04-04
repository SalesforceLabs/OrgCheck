import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';

export default [
    {
        input: './build/src/ui/orgcheck-ui-main.js',
        output: [
            {
                file: './build/dist/orgcheck/orgcheck-ui.js',
                format: 'es',
                name: 'OrgCheckUI'
            },
            {
                file: './build/dist/orgcheck/orgcheck-ui.min.js',
                format: 'cjs',
                name: 'OrgCheckUI',
                plugins: [terser()]
            }
        ],
        plugins: [
            del({ targets: [ 
                './force-app/main/default/lwc/**/libs/orgcheck-ui.**js',
        ]}),
            copy({ targets: [{ 
                src: './build/dist/orgcheck/orgcheck-ui.js', 
                dest: [ 
                    './force-app/main/default/lwc/orgcheckApp/libs', 
                    './force-app/main/default/lwc/orgcheckExtendedDatatable/libs',
                    './force-app/main/default/lwc/orgcheckExportButton/libs',
                    './force-app/main/default/lwc/orgcheckDependencyViewer/libs'
                ],
                rename: 'orgcheck-ui.js'
            }]})
        ]
    }, {
        input: './build/src/api/orgcheck-api-main.js',
        output: [
            {
                file: './build/dist/orgcheck/orgcheck-api.js',
                format: 'es',
                name: 'OrgCheckAPI'
            },
            {
                file: './build/dist/orgcheck/orgcheck-api.min.js',
                format: 'cjs',
                name: 'OrgCheckAPI',
                plugins: [terser()]
            }
        ],
        plugins: [
            del({ targets: [ 
                './force-app/main/default/lwc/**/libs/orgcheck-api.**js' 
            ]}),
            copy({ targets: [{ 
                src: './build/dist/orgcheck/orgcheck-api.js', 
                dest: [
                    './force-app/main/default/lwc/orgcheckApp/libs',
                    './force-app/main/default/lwc/orgcheckExtendedDatatable/libs',
                    './force-app/main/default/lwc/orgcheckDependencyLink/libs',
                    './force-app/main/default/lwc/orgcheckDependencyViewer/libs'
                ],
                rename: 'orgcheck-api.js'
            }]})
        ]
    }
];