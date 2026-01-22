const fs = require('node:fs')
const fflate = require('fflate');

fflate.zip({
    'js': {
        'd3.js': fs.readFileSync('build/libs/d3/d3.js'),
        'fflate.js': fs.readFileSync('build/libs/fflate/fflate.js'),
        'jsforce.js': fs.readFileSync('build/libs/jsforce/jsforce.js'),
        'xlsx.js': fs.readFileSync('build/libs/sheetjs/xlsx.js'),
        'lfs.js': fs.readFileSync('build/libs/lfs/lfscore.js')
    },
    'img': {
        'Logo.svg': fs.readFileSync('build/src/img/Logo.svg'),
        'Mascot.svg': fs.readFileSync('build/src/img/Mascot.svg'),
        'Mascot+Animated.svg': fs.readFileSync('build/src/img/Mascot+Animated.svg')
    }
}, { 
    level: 9 
}, (error, data) => {
    if (error) {
        console.error('Error creating static resource zip:', error);
    } else {
        try {
            fs.writeFileSync(
                'force-app/main/default/staticresources/OrgCheck_SR.resource', 
                Buffer.from(data),
            );
            console.info('Static resource zip created successfully.');
        } catch (error) {
            console.error('Error writing static resource zip to file:', error);
        }
    }
});



