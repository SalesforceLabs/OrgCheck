import { LightningElement, api, track } from 'lwc';

export default class OrgcheckExtentedDatatable extends LightningElement {

    isDataEmpty = true;
    @track _columns;
    @track _rows;
    nbRowsVisible = 0;
    
    @api emptyMessage;
    @api showStatistics = false;
    @api showSearch = false;
    @api stickyHeaders = false;
    @api columnBordered = false;
    @api keyField;

    #sortingColumnIndex;
    #sortingOrder;
    #filteringSearchInput;

    @api set columns(columns) {
        if (columns) {
            this._columns = columns.map((column, index) => { 
                if (column.sorted) {
                    this.#sortingColumnIndex = index;
                    this.#sortingOrder = column.sorted;
                }
                return Object.assign({ 
                    index: index, 
                    sortedAsc: (column.sorted === 'asc'), 
                    sortedDesc: (column.sorted === 'desc')
                }, column);
            });
        }
    }
    get columns() { 
        return this._columns; 
    }
    
    @api set rows(rows) { 
        if (rows && this._columns) {
            this._rows = rows.map((row) => {
                const item = { 
                    key: row[this.keyField], 
                    visible: true,
                    cells: [] 
                };
                this._columns.forEach((column, index) => {
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
            this.filter();
            this.sort();
        }
        this.isDataEmpty = (rows ? rows.length === 0 : true);
    }
    get rows() { 
        return this._rows; 
    }

    handleSearchInputChanged(event) {
        this.#filteringSearchInput = event.target.value;
        this.filter();
        // we don't want the event to be more propagated
        event.stopPropagation();
    }

    handleSortColumnClick(event) {
        this.#sortingColumnIndex = parseInt(event.target.getAttribute('aria-colindex'), 10);
        this.#sortingOrder = 'asc';
        this._columns.forEach((column) => {
            if (column.index === this.#sortingColumnIndex) {
                if (!column.sorted || column.sorted === 'desc') {
                    this.#sortingOrder = column.sorted = 'asc';
                    column.sortedAsc = true;
                    column.sortedDesc = false;
                } else {
                    this.#sortingOrder = column.sorted = 'desc';
                    column.sortedDesc = true;
                    column.sortedAsc = false;
                }
            } else {
                delete column.sorted;
                delete column.sortedAsc;
                delete column.sortedDesc;
            }
        });
        this.sort();
        // we don't want the event to be more propagated
        event.stopPropagation();
    }

    filter() {
        const searchInput = this.#filteringSearchInput;
        if (searchInput && searchInput.length > 2) {
            const s = searchInput.toUpperCase();
            this._rows.forEach((row) => {
                row.visible = (
                    row.cells.findIndex((cell) => {
                        return Object.values(cell).findIndex((value) => {
                            return String(value).toUpperCase().indexOf(s) >= 0;
                        }) >= 0;
                    }) >= 0
                );
            });
        } else {
            this._rows.forEach((row) => { row.visible = true; });
        }
    }

    sort() {
        const columnIndex = this.#sortingColumnIndex;
        const iOrder = this.#sortingOrder === 'asc' ? 1 : -1;
        const type = this._columns[columnIndex].type;
        let value1, value2;
        this._rows.sort((row1, row2) => {
            if (type.endsWith('s')) {
                value1 = row1.cells[columnIndex].values.length || 0;
                value2 = row2.cells[columnIndex].values.length || 0;
            } else {
                value1 = row1.cells[columnIndex].value;
                value2 = row2.cells[columnIndex].value;
            }
            if (value1 && value1.toUpperCase) value1 = value1.toUpperCase();
            if (value2 && value2.toUpperCase) value2 = value2.toUpperCase();
            if (!value1 && value1 !== 0) return 1;
            if (!value2 && value2 !== 0) return -1;
            return (value1 < value2 ? -iOrder : iOrder);
        });
    }

    /**
     * Connected callback function
     */
    connectedCallback() {
    }
}