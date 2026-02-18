const fs = require('node:fs')
const fflate = require('fflate');

const pathLibs = 'build/static-resource/libs/';
const pathImgs = 'build/static-resource/img/';
const staticResourceFilename = 'force-app/main/default/staticresources/OrgCheck_SR.resource';

fflate.zip({
    'js': {
        'd3.js': fs.readFileSync(`${pathLibs}/d3/d3.js`),
        'fflate.js': fs.readFileSync(`${pathLibs}/fflate/fflate.js`),
        'jsforce.js': fs.readFileSync(`${pathLibs}/jsforce/jsforce.js`),
        'xlsx.js': fs.readFileSync(`${pathLibs}/sheetjs/xlsx.js`),
        'lfs.js': fs.readFileSync(`${pathLibs}/lfs/lfscore.js`)
    },
    'img': {
        'Logo.svg': fs.readFileSync(`${pathImgs}/Logo.svg`),
        'Mascot.svg': fs.readFileSync(`${pathImgs}/Mascot.svg`),
        'Mascot+Animated.svg': fs.readFileSync(`${pathImgs}/Mascot+Animated.svg`)
    }
}, { 
    level: 9 
}, (error, data) => {
    if (error) {
        console.error('Error creating static resource zip:', error);
    } else {
        try {
            fs.writeFileSync(staticResourceFilename, Buffer.from(data));
            console.info('Static resource zip created successfully.');
        } catch (error) {
            console.error('Error writing static resource zip to file:', error);
        }
    }
});



