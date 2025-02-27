import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import * as ocui from './libs/orgcheck-ui';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckExportButton extends LightningElement {

    /**
     * @description Flag to know if the api was intiated
     * @type {boolean}
     * @private
     */ 
    _apiInitialized = false;

    /**
     * @description Excel API used to generate documents
     * @type {any}
     * @private
     */ 
    _api;

    /**
     * @description Called when it's about to render the component
     */
    renderedCallback() {
        // Load only if the api is not already initilized
        if (this._apiInitialized === false) {
            loadScript(this, OrgCheckStaticRessource + '/js/xlsx.js')
                .then(() => {
                    this._apiInitialized = true;
                    this.buttonDisabled = false;
                    // @ts-ignore
                    this._api = XLSX; 
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    }
    
    /**
     * @description Flag to disable the button if the XLS api is not yet loaded
     * @type {boolean}
     * @public
     */ 
    buttonDisabled = true;

    /**
     * @type {Array<ocui.ExportedTable>}
     */
    @api source;
    
    /**
     * @description Basename use to generate the name of the tile
     * @type {string}
     * @default "Export"
     * @public
     */ 
    @api basename = 'Export';

    /**
     * @description Label of the button
     * @type {string}
     * @default "Export"
     * @public
     */ 
    @api label = 'Export';

    /**
     * @description Event when user clicks on the export button
     * @public
     */
    handleClickExportXLS() {
        try {
            const workbook = this._createTheWorkBook();
            const url = this._generateTheFileAsURL(workbook);

            const a = this.template.querySelector('a');
            a.href = url;
            a.download = `${this.basename}.xlsx`; // Filename Here
            a.click(); // Downloaded file*/

            this._releaseTheURL(url);

        } catch (error) {
            console.error(error, JSON.stringify(error), error.stack);
        }
    }

    /**
     * @description Internal method to create an Excel Workbook using the API
     * @returns {any} The workbook
     * @private
     */ 
    _createTheWorkBook() {
        const workbook = this._api.utils.book_new();
        this.source.forEach(item => {
            const datasheet = [ item.columns ].concat(item.rows);
            const worksheet = this._api.utils.aoa_to_sheet(datasheet);
            worksheet['!cols'] = item.columns.map((c, i) => { 
                const maxWidth = datasheet.reduce((prev, curr) => {
                    if (typeof curr[i] === 'string') return Math.max(prev, curr[i]?.length);
                    return prev;
                }, 10);
                return maxWidth ? { wch: maxWidth } : {};
            });
            const sheetName = `${item.header} (${item.rows.length})`.substring(0, 31); // Cannot exceed 31 characters!
            this._api.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
        return workbook;
    }

    /**
     * @description Internal method to create an Excel Workbook using the API
     * @returns {string} The file as an object URL
     * @private
     */ 
    _generateTheFileAsURL(workbook) {
        const workfile = this._api.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const workfileAsBuffer = new ArrayBuffer(workfile.length)
        const workfileAsBufferView = new Uint8Array(workfileAsBuffer)
        for (let i = 0; i < workfile.length; i++) workfileAsBufferView[i] = workfile.charCodeAt(i) & 0xff
        return URL.createObjectURL(new Blob([workfileAsBuffer], { type: 'application/octet-stream' }));
    }

    /**
     * @description Internal method to release the URL created by _generateTheFileAsURL
     * @private
     */ 
    _releaseTheURL(url) {
        URL.revokeObjectURL(url);
    }
}