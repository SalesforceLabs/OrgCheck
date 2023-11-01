import { LightningElement, api, track } from 'lwc';

export default class OrgcheckExtentedDatatable extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        if (this.dontUseAllSpace === true) {
            this.tableStyle = 'width: unset;';
        }
    }
    
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
     * Are we gonna use the dependency viewer in this table?
     * true if one of the columns are of type ""
     */
    usesDependencyViewer = false;

    /**
     * Are the statistics going to be shown on top of the table?
     */
    @api showStatistics = false;
    
    /**
     * Do you want the search input to be displayed?
     * And the filter to be enabled?
     */
    @api showSearch = false;

    @api showScoreColumn = false;

    @api showRowNumberColumn = false;

    @api dontUseAllSpace = false;

    tableStyle = '';

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
        const start = Date.now();

        if (columns) {
            this.usesDependencyViewer = false;
            const _columns = [];
            if (this.showRowNumberColumn === true) {
                _columns.push({ label: '#', type: 'index' });
            }
            if (this.showScoreColumn === true) {
                _columns.push({ label: 'Score', type: 'score', data: { value: 'badScore' }, sorted: 'desc' });
            }
            _columns.push(...columns);
            this._columns = _columns.map((column, index) => { 
                if (column.sorted) {
                    this.#sortingColumnIndex = index;
                    this.#sortingOrder = column.sorted;
                }
                if (this.usesDependencyViewer === false && column.type === 'dependencyViewer') {
                    this.usesDependencyViewer = true;
                }
                return Object.assign({ 
                    index: index, 
                    cssClass: column.sorted ? `sorted sorted-${column.sorted}` : ''
                }, column);
            });
        }

        const end = Date.now();
        console.error('rows()', start, end, end-start);
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
        const start = Date.now();

        if (rows && this._columns) {
            this._rows = rows.map((row, rowIndex) => {
                const item = { 
                    key: rowIndex, 
                    visible: true,
                    cells: [] 
                };
                this._columns.forEach((column, columnIndex) => {
                    let ref = row;
                    if (column.data?.ref) {
                        column.data?.ref.split('.').forEach((r) => { ref = ref[r]; });
                    }
                    if (ref) {
                        const cell = { key: columnIndex };
                        cell[`type_${column.type}`] = true;
                        if (column.type.endsWith('s')) {
                            // Iterable data in a cell
                            const values = ref[column.data.values];
                            if (column.type === 'texts') {
                                cell.values = values;
                            } else {
                                cell.values = values?.map((v) => {
                                    if (typeof v === 'string') return v;
                                    const value = {};
                                    Object.keys(column.data).filter(d => d !== 'values').forEach(d => {
                                        value[d] = v[column.data[d]];
                                    });
                                    return value;
                                });
                            }
                        } else if (column.type !== 'index') {
                            // Unique value in a cell
                            cell.value = ref[column.data.value];
                            Object.keys(column.data).filter(d => d !== 'value').forEach(d => {
                                cell[d] = ref[column.data[d]];
                            });
                            if (column.type === 'score') {
                                item.score = cell.value;
                                if (cell.value > 0) {
                                    item.cssClass = 'bad';
                                    cell.cssClass = 'bad badscore';
                                }
                            } else if (column.type === 'numeric') {
                                if (column.data.max && cell.value > column.data.max) {
                                    cell.isMaxReached = true; 
                                    cell.valueAfterMax = column.data.valueAfterMax;
                                } else if (column.data.min && cell.value < column.data.min) {
                                    cell.isMinReached = true; 
                                    cell.valueBeforeMin = column.data.valueBeforeMin;
                                }
                            } else if (column.type === 'text') {
                                if (column.data.maximumLength && cell.value && cell.value.length > column.data.maximumLength) {
                                    cell.value = cell.value.substring(0, column.data.maximumLength);
                                    cell.isValueTruncated = true;
                                }
                            }
                            if (!cell.value && cell.value !== 0) cell.valueIfEmpty = column.data.valueIfEmpty;
                        }
                        if (row.hasBadField && (
                                (column.data?.ref && row.hasBadField(column.data.ref)) || 
                                (column.data?.value && row.hasBadField(column.data.value))
                            )) {
                            cell.cssClass = 'bad badcell';
                        }
                        item.cells.push(cell);
                    }
                });
                return item;
            });
            this.nbRows = this._rows.length;
            this.isDataEmpty = (this.nbRows === 0);
            this.filter();
            this.sort();

            const end = Date.now();
            console.error('rows()', start, end, end-start);
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
                } else {
                    this.#sortingOrder = column.sorted = 'desc';
                }
                column.cssClass = `sorted sorted-${column.sorted}`;
            } else {
                delete column.sorted;
                delete column.cssClass;
            }
        });
        this.sort();
    }

    async handleViewDependency(event) {
        const viewer = this.template.querySelector('c-orgcheck-dependency-viewer');
        viewer.open(event.target.whatid, event.target.whatname, event.target.dependencies);
    }

    /**
     * Internal filter method which takes into account the <code>#filteringSearchInput</code> property
     */
    filter() {
        const start = Date.now();

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
                if (row.visible === true) {
                    row.key = ++this.nbRowsVisible;
                }
            });
        } else {
            this.isFilterOn = false;
            this._rows.forEach((row, index) => { 
                row.visible = true; 
                row.key = index+1;
            });
        }

        const end = Date.now();
        console.error('filter()', start, end, end-start);
    }

    /**
     * Internal sort method which takes into account the <code>#sortingColumnIndex</code> and <code>sortingOrder</code> properties
     */
    sort() {
        const start = Date.now();

        if (this.#sortingColumnIndex === undefined) return;
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
        }).forEach((row, index) => { 
            row.key = index+1; 
        });

        const end = Date.now();
        console.error('sort()', start, end, end-start);
}
}