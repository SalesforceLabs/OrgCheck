import { readFileSync, writeFileSync } from 'node:fs';
import { zip } from 'fflate';

const logSuccess = (msg) => console.info("\x1b[32m%s\x1b[0m", `✅ ${msg}`);
const logError = (msg, error) => console.error("\x1b[31m%s\x1b[0m", `❌ ${msg}`, error);

const pathOrgCheckLibs = '../orgcheck-api/dist';
const pathLibs = 'build/static-resource/libs/';
const pathImgs = 'build/static-resource/img/';
const staticResourceFilename = 'force-app/main/default/staticresources/OrgCheck_SR.resource';

try {
    zip({
        'js': {
            'orgcheck.js': readFileSync(`${pathOrgCheckLibs}/orgcheck.js`),
            'd3.js': readFileSync(`${pathLibs}/d3/d3.js`),
            'fflate.js': readFileSync(`${pathLibs}/fflate/fflate.js`),
            'jsforce.js': readFileSync(`${pathLibs}/jsforce/jsforce.js`),
            'xlsx.js': readFileSync(`${pathLibs}/sheetjs/xlsx.js`),
            'lfs.js': readFileSync(`${pathLibs}/lfs/lfscore.js`)
        },
        'img': {
            'Logo.svg': readFileSync(`${pathImgs}/Logo.svg`),
            'Mascot.svg': readFileSync(`${pathImgs}/Mascot.svg`),
            'Mascot+Animated.svg': readFileSync(`${pathImgs}/Mascot+Animated.svg`)
        }
    }, { 
        level: 9 
    }, (error, data) => {
        if (error) {
            logError(`Error creating static resource zip: ${error.message}`, error);
        } else {
            try {
                writeFileSync(staticResourceFilename, Buffer.from(data));
                logSuccess(`Static resource zip created successfully (${staticResourceFilename}).`);
            } catch (error) {
                logError(`Error writing static resource zip to file: ${error.message}`, error);
            }
        }
    });
} catch (error) {
    logError(`Error while executing the script: ${error.message}`, error);
}


