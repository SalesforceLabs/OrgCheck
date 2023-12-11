import { LightningElement, api } from 'lwc';

const CELL_PREPARE = (reference, column, cell = {}) => {
    column.dataProperties.forEach((p) => {
        cell[p] = reference[column.data[p]];
    });
    return cell;
}

const ROW_CSSCLASS = (row, isVisible) => {
    return (row.score === 0 ? '': 'bad') + ' ' + (isVisible === true ? '' : 'invisible');
}

export default class OrgcheckExtentedDatatable extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        if (this.dontUseAllSpace === true) {
            this.tableClasses += ' dontuseallspace';
        }
        if (this.isColumnBordered === true) {
            this.tableClasses += ' slds-table_col-bordered';
        }
        if (this.isStickyHeaders === true) {
            this.tableClasses += 'slds-table_header-fixed';
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
     * Are the statistics going to be shown on top of the table?
     */
    @api showStatistics = false;

    /**
     * Total number of rows (even if the filter is on)
     */
    nbRows = 0;

    /**
     * Number of rows that match the filter
     */
    nbRowsVisible = 0;

    /**
     * Total number of rows that have a bad score (>0)
     */
    nbBadRows = 0;
    
    /**
     * Sum of all the bad scores
     */
    sumScore = 0;

    /**
     * Is the search active and records are filtered
     */
    isFilterOn = false;
    
    /**
     * Are we gonna use the dependency viewer in this table?
     * true if one of the columns are of type "dependencyViewer"
     * False by default.
     */
    usesDependencyViewer = false;
    
    /**
     * Do you want the search input to be displayed?
     * And the filter to be enabled?
     * False by default.
     */
    @api showSearch = false;

    /**
     * Do you want to show the SCORE column in the table?
     * No need to add it to the columns, flag this property to true
     * False by default.
     */
    @api showScoreColumn = false;

    /**
     * Do you want to show the ROW NUMBER column in the table?
     * No need to add it to the columns, flag this property to true
     * False by default.
     */
    @api showRowNumberColumn = false;

    /**
     * Do you want the table to use all the horizontal space or not?
     * False by default.
     */
    @api dontUseAllSpace = false;

    /**
     * CSS classes for the table
     */
    tableClasses = 'slds-table slds-table_bordered slds-is-selected slds-cell-wrap';

    /**
     * Do you need the headers to stick on top of the screen even if you scroll down?
     */
    @api isStickyHeaders = false;
    
    /**
     * Do you need the table to have a border?
     */
    @api isColumnBordered = false;
    
    /**
     * Internal array of columns
     */
    #columns;

    /**
     * Internal array of rows
     */
    #rows;

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
     * Setter for the columns (it will set the internal <code>#columns</code> property)
     * 
     * @param {Array<any>} columns 
     */
    @api set columns(columns) {
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
            this.#columns = _columns.map((c, i) => { 
                if (c.sorted) {
                    this.#sortingColumnIndex = i;
                    this.#sortingOrder = c.sorted;
                }
                if (this.usesDependencyViewer === false && c.type === 'dependencyViewer') {
                    this.usesDependencyViewer = true;
                }
                return Object.assign({
                    index: i, 
                    cssClass: c.sorted ? `sorted sorted-${c.sorted}` : '',
                    dataProperties: c.data ? (Object.keys(c.data).filter((k) => k !== 'ref')) : [],
                    typeProperty: `is${c.type.charAt(0).toUpperCase()}${c.type.slice(1)}`,
                    isIterative: c.type.endsWith('s')
                }, c);
            });
        }
    }
   
    /**
     * Getter for the columns (it will return the internal <code>#columns</code> property)
     * 
     * @return {Array<any>} columns 
     */
    get columns() {
        return this.#columns;
    }

    /**
     * Setter for the rows (it will set the internal <code>#rows</code> property).
     * 
     * @param {Array<any>} rows 
     */
    @api set rows(rows) {
        if (!this.#columns) {
            return;
        }
        if (rows && typeof rows === 'string') {
            try {
                rows = JSON.parse(rows);
            } catch (e) {
                rows = undefined;
            }
        };
        if (!rows || Array.isArray(rows) === false) {
            this.nbRows = 0;
            this.isDataEmpty = true;
            return;
        }
        // Here 'rows' is defined and is an array
        this.nbRows = rows.length || 0;
        if (rows.length !== 0) {
            this.isDataEmpty = false;
            //this._filter();
            //this._sort();
        } else {
            this.isDataEmpty = true;
        }
        this.#rows = rows.map((r, i) => { 
            // Initiate the row
            const row = { 
                key: i, 
                cssClass: ROW_CSSCLASS(r, true),
                score: r.score,
                cells: []
            };
            // Iterate over the columns to prepare the cells of that row
            this.#columns.forEach((c, j) => {
                // By default the reference used in the properties is the row itself
                // Unless the 'ref' property in column.data is specified 
                let ref = r;
                if (c.data?.ref) {
                    c.data?.ref.split('.').forEach((p) => { ref = ref[p]; });
                }
                // Prepare the cell information
                const cell = { key: `${i}.${j}` };
                cell[c.typeProperty] = true;
                if (c.isIterative === true) {
                    cell.values = ref[c.data.values]?.map((d) => CELL_PREPARE(d, c));
                } else {
                    CELL_PREPARE(ref, c, cell);
                }
                row.cells.push(cell);
            });
            return row; 
        });
    }

    /**
     * Getter for the rows (it will return the internal <code>#rows</code> property)
     * 
     * @return {Array<any>} rows 
     */
    get rows() {
        return this.#rows;
    }
        
    /**
     * Handler when a user type a search text in the appropriate input text field
     * 
     * @param {Event} event 
     */
    handleSearchInputChanged(event) {
        this.#filteringSearchInput = event.target.value;
        this._filter();
    }

    /**
     * Handler when a user clicks on a header of the table
     * 
     * @param {Event} event 
     */
    handleSortColumnClick(event) {
        this.#sortingColumnIndex = parseInt(event.target.getAttribute('aria-colindex'), 10);
        this.#sortingOrder = 'asc';
        this.#columns.forEach((column) => {
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
        this._sort();
    }

    async handleViewDependency(event) {
        const viewer = this.template.querySelector('c-orgcheck-dependency-viewer');
        viewer.open(event.target.whatid, event.target.whatname, event.target.dependencies);
    }

    /**
     * Internal filter method which takes into account the <code>#filteringSearchInput</code> property
     */
    _filter() {
        const searchInput = this.#filteringSearchInput;
        this.nbRowsVisible = 0;
        if (searchInput && searchInput.length > 2) {
            this.isFilterOn = true;
            const s = searchInput.toUpperCase();
            this.#rows.forEach((row) => {
                const rowIsVisible = (
                    row.cells.findIndex((cell) => {
                        return Object.values(cell).findIndex((value) => {
                            return String(value).toUpperCase().indexOf(s) >= 0;
                        }) >= 0;
                    }) >= 0
                );
                if (rowIsVisible === true) {
                    row.key = ++this.nbRowsVisible;
                }
                row.cssClass = ROW_CSSCLASS(row, rowIsVisible);
            });
        } else {
            this.isFilterOn = false;
            this.#rows.forEach((row, index) => { 
                row.cssClass = ROW_CSSCLASS(row, true);
                row.key = index+1;
            });
        }
    }

    /**
     * Internal sort method which takes into account the <code>#sortingColumnIndex</code> and <code>sortingOrder</code> properties
     */
    _sort() {
        if (this.#sortingColumnIndex === undefined) return;
        const columnIndex = this.#sortingColumnIndex;
        const iOrder = this.#sortingOrder === 'asc' ? 1 : -1;
        const type = this.#columns[columnIndex].type;
        let value1, value2;
        this.#rows.sort((row1, row2) => {
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
    }
}