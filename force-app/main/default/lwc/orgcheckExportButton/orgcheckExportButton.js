import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckExportButton extends LightningElement {

    #apiInitialized = false;
    #api;

    /**
     * Called when it's about to render the component
     */
    renderedCallback() {
        // Load only if the api is not already initilized
        if (this.#apiInitialized === false) {
            loadScript(this, OrgCheckStaticRessource + '/js/xlsx.js')
                .then(() => {
                    this.#apiInitialized = true;
                    this.buttonDisabled = false;
                    // eslint-disable-next-line no-undef
                    this.#api = XLSX; 
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    }
    
    buttonDisabled = true;

    @api sourceColumns;
    @api sourceRows
    @api basename = 'Export';
    @api sheetname = 'Data';

    async handleClickExportXLS() {
        // create data
        const table = [this.sourceColumns.map(col => col.label)].concat(this.sourceRows.map(row => row.cells.map(cell => cell.data.value)));
        // create workbook
        const wb = this.#api.utils.book_new();
        const ws = this.#api.utils.aoa_to_sheet(table);
        this.#api.utils.book_append_sheet(wb, ws, this.sheetname);
        // export
        const excel = this.#api.write(wb, { bookType: 'xlsx', type: 'base64' });
        // Generate the link to download
        const a = this.template.querySelector('a')
        a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64, ${excel}`;
        a.download = `${this.basename}.xlsx`; // Filename Here
        a.click(); // Downloaded file
    }
}