import { LightningElement, api, track } from 'lwc';

export default class OrgcheckExtentedDatatable extends LightningElement {

    /**
     * Is there no records at all to display?
     */
    isDataEmpty = true;

    /**
     * If no data then this message will appear instead of the table
     */
    @api emptyMessage;

    /**
     * Is the search is active and records are filtered
     */
    isFilterOn = false;

    /**
     * Total number of rows (even if the filter is on)
     */
    nbRows = 0;

    /**
     * Number of rows that match the filter
     */
    nbRowsVisible = 0;
    
    /**
     * Are the statistics going to be shown on top of the table?
     */
    @api showStatistics = false;
    
    /**
     * Do you want the search input to be displayed?
     * And the filter to be enabled?
     */
    @api showSearch = false;

    /**
     * Do you need the headers to stick on top of the screen even if you scroll down?
     * (not yet implemented)
     */
    //@api stickyHeaders = false;
    
    /**
     * Do you need the table to have a border?
     * (not yet implemented)
     */
    //@api columnBordered = false;
    
    /**
     * Internal array of columns
     */
    @track _columns;

    /**
     * Internal array of rows
     */
    @track _rows;

    /**
     * Internal property that indicates the current column index which is used by the sort method
     */
    #sortingColumnIndex;

    /**
     * Internal property that indicates the current order which is used by the sort method
     */
    #sortingOrder;

    /**
     * Internal property that indicate the current search input index which is used by the filter method
     */
    #filteringSearchInput;

    /**
     * Setter for the columns (it will set the internal <code>_columns</code> property)
     * 
     * @param {Array<any>} columns 
     */
    @api set columns(columns) {
        if (columns) {
            const _columns = [{ label: 'Score', type: 'numeric', data: { value: 'score' }, isScore: true, sorted: 'desc', sortedDesc: true }];
            _columns.push(...columns);
            this._columns = _columns.map((column, index) => { 
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

    /**
     * Getter for the columns
     */
    get columns() { 
        return this._columns; 
    }
    
    /**
     * Setter for the rows (it will set the internal <code>_rows</code> property).
     * This method relies on the internal <code>_columns</code> property as well.
     * 
     * @param {Array<any>} rows 
     */
    @api set rows(rows) { 
        if (rows && this._columns) {
            this._rows = rows.map((row, rowIndex) => {
                const item = { 
                    key: rowIndex, 
                    visible: true,
                    cells: []
                };
                this._columns.forEach((column, columnIndex) => {
                    let ref = row;
                    if (column.data.ref) column.data.ref.split('.').forEach((r) => { ref = ref[r]; });
                    if (ref) {
                        const cell = { key: columnIndex };
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
                            if (column.type === 'numeric' && column.data.max && cell.value > column.data.max) {
                                cell.isMaxReached = true; 
                                cell.valueAfterMax = column.data.valueAfterMax;
                            }
                            if (!cell.value && cell.value !== 0) cell.valueIfEmpty = column.data.valueIfEmpty;
                        }
                        if (column.isScore === true && cell.value > 0) item.cssClass = 'orgcheck-table-tr-badrow';
                        item.cells.push(cell);
                    }
                });
                return item;
            });
            this.nbRows = this._rows.length;
            this.isDataEmpty = (this.nbRows === 0);
            this.filter();
            this.sort();
        }
    }

    /**
     * Getter for the rows
     */
    get rows() { 
        return this._rows; 
    }

    /**
     * Handler when a user type a search text in the appropriate input text field
     * 
     * @param {Event} event 
     */
    handleSearchInputChanged(event) {
        this.#filteringSearchInput = event.target.value;
        this.filter();
        // we don't want the event to be more propagated
        event.stopPropagation();
    }

    /**
     * Handler when a user clicks on a header of the table
     * 
     * @param {Event} event 
     */
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

    /**
     * Internal filter method which takes into account the <code>#filteringSearchInput</code> property
     */
    filter() {
        const searchInput = this.#filteringSearchInput;
        this.nbRowsVisible = 0;
        if (searchInput && searchInput.length > 2) {
            this.isFilterOn = true;
            const s = searchInput.toUpperCase();
            this._rows.forEach((row) => {
                row.visible = (
                    row.cells.findIndex((cell) => {
                        return Object.values(cell).findIndex((value) => {
                            return String(value).toUpperCase().indexOf(s) >= 0;
                        }) >= 0;
                    }) >= 0
                );
                if (row.visible) this.nbRowsVisible++;
            });
        } else {
            this.isFilterOn = false;
            this._rows.forEach((row) => { row.visible = true; });
        }
    }

    /**
     * Internal sort method which takes into account the <code>#sortingColumnIndex</code> and <code>sortingOrder</code> properties
     */
    sort() {
        const columnIndex = this.#sortingColumnIndex;
        const iOrder = this.#sortingOrder === 'asc' ? 1 : -1;
        const type = this._columns[columnIndex].type;
        let value1, value2;
        this._rows.sort((row1, row2) => {
            if (type.endsWith('s')) {
                value1 = row1.cells[columnIndex].values.length || undefined;
                value2 = row2.cells[columnIndex].values.length || undefined;
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
}