import { LightningElement, api, track } from 'lwc';

export default class OrgcheckExtentedDatatable extends LightningElement {

    @api showStatistics = false;
    @api showSearch = false;
    @api stickyHeaders = false;
    @api columnBordered = false;
    @api columns;
    @api keyField;
    @api set rows(rows) { 
        if (rows && this.columns) {
            this.data = rows.map((row) => {
                const item = { 
                    key: row[this.keyField], 
                    cells: [] 
                };
                this.columns.forEach((column, index) => {
                    let ref = row;
                    if (column.data.ref) column.data.ref.split('.').forEach((r) => { ref = ref[r]; });
                    const cell = {
                        name: index,
                        value: ref[column.data.value]
                    };
                    cell[`type_${column.type}`] = true;
                    Object.keys(column.data).forEach(d => {
                        cell[d] = ref[column.data[d]];
                    });
                    item.cells.push(cell);
                });
                return item;
            });
        }
    }
    get rows() { 
        return this.data; 
    }

    @track data;
    nbRowsVisible = 0;

    handleSearch(event) {
        console.error('IMPLEMENT ME', event);
    }

    connectedCallback() {
    }
}