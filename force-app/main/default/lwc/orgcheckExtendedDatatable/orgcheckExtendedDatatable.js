import { LightningElement, api, track } from 'lwc';

export default class OrgcheckExtentedDatatable extends LightningElement {

    isDataEmpty = true;
    @api emptyMessage;
    @api showStatistics = false;
    @api showSearch = false;
    @api stickyHeaders = false;
    @api columnBordered = false;
    @api columns;
    @api keyField;
    @api set rows(rows) { 
        this.isDataEmpty = (rows ? rows.length === 0 : true);
        if (rows && this.columns) {
            this.data = rows.map((row) => {
                const item = { 
                    key: row[this.keyField], 
                    cells: [] 
                };
                this.columns.forEach((column, index) => {
                    let ref = row;
                    if (column.data.ref) column.data.ref.split('.').forEach((r) => { ref = ref[r]; });
                    if (ref) {
                        const cell = { name: index };
                        cell[`type_${column.type}`] = true;
                        if (column.type.endsWith('s')) {
                            // iterable
                            if (column.type === 'texts') {
                                cell.values = ref[column.data.values];
                            } else {
                                cell.values = ref[column.data.values].map((v) => {
                                    if (typeof v === 'string') return v;
                                    const value = {};
                                    Object.keys(column.data).filter(d => d !== 'values').forEach(d => {
                                        value[d] = v[column.data[d]];
                                    });
                                    return value;
                                });
                            }
                        } else {
                            // unique value
                            cell.value = ref[column.data.value];
                            Object.keys(column.data).filter(d => d !== 'value').forEach(d => {
                                cell[d] = ref[column.data[d]];
                            });
                        }
                        item.cells.push(cell);
                    }
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

    /**
     * Connected callback function
     */
    connectedCallback() {
    }
}