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

    /**
     * Array of items
     * 
     * Item being like:
     * { 
     *     header: 'Opportunity', 
     *     columns: [
     *         { label: 'Id', field: 'id' },  
     *         { label: 'Name', field: 'name' }
     *     ], 
     *     rows: [
     *         { id: 'ida', name; 'namea' }, 
     *         { id: 'idb', name; 'nameb' }, 
     *         { id: 'idc', name; 'namec' }
     *     ]
     * }
     * 
     * OR
     * 
     * Item could also be like:
     * { 
     *     header: 'Opportunity', 
     *     columns: [ 'Id', 'Name' ], 
     *     rows: [
     *         [ 'ida', 'namea' ], 
     *         [ 'idb', 'nameb' ], 
     *         [ 'idc', 'namec' ]
     *     ]
     * }
     */
    @api source;
    
    @api basename = 'Export';

    handleClickExportXLS() {
        try {
            // create workbook
            const workbook = this.#api.utils.book_new();
            this.source.forEach(item => {
                if (item.rows.length === 0) return;
                const isTypeSimple = typeof item.columns[0] === 'string';
                const datasheet_columns = isTypeSimple ? item.columns : (item.columns.map(c => c?.label));
                const datasheet_rows = isTypeSimple ? item.rows : item.rows.map(r => item.columns.map(c => r[c.field]));
                const datasheet = [ datasheet_columns ].concat(datasheet_rows);
                const worksheet = this.#api.utils.aoa_to_sheet(datasheet);
                worksheet['!cols'] = item.columns.map((c, i) => { 
                    const maxWidth = datasheet.reduce((prev, curr) => {
                        if (typeof curr[i] === 'string') return Math.max(prev, curr[i]?.length);
                        return prev;
                    }, 10);
                    return maxWidth ? { wch: maxWidth } : {};
                });
                this.#api.utils.book_append_sheet(workbook, worksheet, `${item.header} (${item.rows.length})`);
            });
            const workfile = this.#api.write(workbook, { bookType: 'xlsx', type: 'base64' });

            // Generate the link to download
            const a = this.template.querySelector('a')
            a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64, ${workfile}`;
            a.download = `${this.basename}.xlsx`; // Filename Here
            a.click(); // Downloaded file

        } catch (error) {
            console.error(error);
        }

    }
}