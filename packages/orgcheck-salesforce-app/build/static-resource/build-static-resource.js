import { readFileSync, writeFileSync } from 'node:fs';
import { zip } from 'fflate';

// Wrap a JS library bundle so it uses `self` as the global instead of `window`.
// This is the Salesforce-recommended fix for Lightning Web Security (LWS) compatibility:
// scripts loaded via loadScript() run in a sandboxed compartment where assignments to
// the virtual `window` proxy are not visible from other contexts.
// Using `self` as the global target makes the library accessible within the LWS sandbox.
const wrapForLWS = (buf) => Buffer.concat([
    Buffer.from('(function(global){var window=global;\n'),
    buf,
    Buffer.from('\n})(typeof self!=="undefined"?self:this);\n')
]);

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
            'jsforce.js': wrapForLWS(readFileSync(`${pathLibs}/jsforce/jsforce.js`)),
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


