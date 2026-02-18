const fs = require('node:fs')

const configs = [
    {
        input: '../orgcheck-api/dist/orgcheck-api.js',
        output: [
            'force-app/main/default/lwc/orgcheckApp/libs/orgcheck-api.js', 
            'force-app/main/default/lwc/orgcheckDependencyLink/libs/orgcheck-api.js',
            'force-app/main/default/lwc/orgcheckDependencyViewer/libs/orgcheck-api.js',
            'force-app/main/default/lwc/orgcheckExtendedDatatable/libs/orgcheck-api.js'
        ]
    },
    {
        input: '../orgcheck-api/dist/orgcheck-ui.js',
        output: [
            'force-app/main/default/lwc/orgcheckApp/libs/orgcheck-ui.js', 
            'force-app/main/default/lwc/orgcheckDependencyViewer/libs/orgcheck-ui.js', 
            'force-app/main/default/lwc/orgcheckExportButton/libs/orgcheck-ui.js', 
            'force-app/main/default/lwc/orgcheckExtendedDatatable/libs/orgcheck-ui.js'
        ]
    }    
];

configs.forEach((config) => {
    const inputFilename = config.input;
    config.output.forEach((outputFilename) => {
        const libFolder = outputFilename.substring(0, outputFilename.lastIndexOf('/'));
        if (fs.existsSync(libFolder) === false) {
            console.info(`Folder ${libFolder} did not exist we created it.`);
            fs.mkdirSync(libFolder);
        }
        console.info(`Copying ${inputFilename} to ${outputFilename}`);
        fs.copyFileSync(inputFilename, outputFilename);
    });
});

/*
lwcs.forEach((lwc) => {
    const path = `${lwcPath}/${lwc}/${pathLibs}`;
    const libfile = `${path}/${filenameLib}`;
    if (fs.existsSync(path) === false) {
        console.info(`Directory <${path}> was created.`)
        fs.mkdirSync(path);
    }
    if (fs.existsSync(apiLib) === false) {
        console.error(`File <${apiLib}> does not exist.`)
    }
    fs.copyFileSync(apiLib, libfile);
});
*/