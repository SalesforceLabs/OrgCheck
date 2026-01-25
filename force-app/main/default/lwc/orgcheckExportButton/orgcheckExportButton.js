import { LightningElement, api } from 'lwc';
import OrgCheckStaticResource from "@salesforce/resourceUrl/OrgCheck_SR";
import * as ocui from './libs/orgcheck-ui.js';
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
     * @description Called when it's about to render the component
     */
    renderedCallback() {
        // Load only if the api is not already initilized
        if (this._apiInitialized === false) {
            loadScript(this, OrgCheckStaticResource + '/js/xlsx.js')
                .then(() => {
                    this._apiInitialized = true;
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    }
    
    /**
     * @description Flag to know if the data is being exported
     * @type {boolean}
     * @public
     */ 
    isExporting = false;

    /**
     * @description Flag to disable the button if the XLS api is not yet loaded
     * @type {boolean}
     * @public
     */ 
    get buttonDisabled() {
        return (this._apiInitialized === false || this.isExporting === true);
    }

    /**
     * @description Label of the button
     * @type {string}
     * @public
     */ 
    get buttonLabel() {
        if (this._apiInitialized === false) return 'Initializing...';
        if (this.isExporting === true) return 'Exporting...';
        return this.label;
    }

    /**
     * @type {Array<ocui.ExportedTable> | ocui.ExportedTable}
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
     * @description Label of the button when not clicked (otherwise it will be "Exporting...")
     * @type {string}
     * @default "Export"
     * @public
     */ 
    @api label = 'Export';

    /**
     * @description Event when user clicks on the export button
     * @async
     * @public
     */
    async handleClickExportXLS() {
        this.isExporting = true;
        try {
            const url = URL.createObjectURL(ocui.Exporter.exportAsXls(this.source));
            const a = this.template.querySelector('a');
            a.href = url;
            a.download = `${this.basename}.xlsx`; // Filename Here
            a.click(); // Downloaded file*/
            URL.revokeObjectURL(url);
        } catch(error) {
            console.error(error, JSON.stringify(error), error.stack);
        } finally {
            this.isExporting = false;
        }
    }
}