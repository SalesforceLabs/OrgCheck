import { LightningElement, api, track } from 'lwc';

const TYPE_INDEX = 'index';
const TYPE_SCORE = 'score';

const SORT_ORDER_ASC = 'asc';
const SORT_ORDER_DESC = 'desc';

const CELL_PREPARE = (reference, column, cell = { data: {}}) => {
    if (column.dataProperties.length > 0) {
        column.dataProperties.forEach((p) => {
            cell.data[p] = reference[column.data[p]];
        });
    } else {
        cell.data.value = reference;
    }
    if (column.modifier?.valueIfEmpty && !cell.data.value) {
        cell.data.decoratedValue = column.modifier.valueIfEmpty;
        cell.isEmpty = true;
    } else {
        switch (column.typeProperty) {
            case 'isNumeric':
                if (column.modifier?.max && cell.data.value > column.modifier.max) {
                    cell.data.decoratedValue = column.modifier.valueAfterMax;
                    cell.isMaxReached = true;
                } else if (column.modifier?.min && cell.data.value < column.modifier.min) {
                    cell.data.decoratedValue = column.modifier.valueBeforeMin;
                    cell.isMinReached = true;
                }
                break;
            case 'isText':
                if (column.modifier?.maximumLength && cell.data.value.length > column.modifier.maximumLength) {
                    cell.data.decoratedValue = cell.data.value.substr(0, column.modifier.maximumLength);
                    cell.isValueTruncated = true;
                }
                break;
        }
    }
    return cell;
}

const CELL_CSSCLASS = (row, cell) => {
    if (cell.type === TYPE_SCORE && row.badScore > 0) {
        return 'bad badscore';
    }
    return (row.badFields && row.badFields.includes(cell.data?.ref || cell.data?.value) === true) ? 'bad' : '';
}

const ROW_CSSCLASS = (row, showScore) => {
    return ((showScore === true && row.badScore > 0)? 'bad': '');
}

const HEADER_CSSCLASS = (column, isSticky) => {
    return (column.sorted ? `sorted sorted-${column.sorted}` : '') + ' ' + (isSticky === true? 'sticky' : '');
}

export default class OrgcheckExtentedDatatable extends LightningElement {

    /**
     * Connected callback function
     */
    connectedCallback() {
        if (this.dontUseAllSpace === true) {
            this.tableClasses += ' dontuseallspace';
        }
    }

    /**
     * Is there no records at all to display?
     */
    @track isDataEmpty = true;

    /**
     * If no data then this message will appear instead of the table
     */
    @api emptyMessage;

    /**
     * Are the statistics going to be shown on top of the table?
     */
    @api showStatistics = false;

    /**
     * Total number of all rows (even if the filter is on)
     */
    @track nbAllRows = 0;

    /**
     * Number of rows that match the filter
     */
    @track nbFilteredRows = 0;

    /**
     * Total number of rows that have a bad score (>0)
     */
    @track nbBadRows = 0;
    
    /**
     * Is the search active and records are filtered
     */
    @track isFilterOn = false;
    
    /**
     * Do you want the infinite scrolling feature to be enabled?
     * False by default
     */
    @api isInfiniteScrolling = false;
    
    /**
     * Available only if "isInfiniteScrolling" is enabled.
     * After you set rows, how many maximum rows you want to start showing?
     */
    @api infiniteScrollingInitialNbRows;
    
    /**
     * Available only if "isInfiniteScrolling" is enabled.
     * How many rows do you want to show after hitting the button "show more..."?
     */
    @api infiniteScrollingAdditionalNbRows;

    /**
     * How many rows are currently shown?
     */
    @track infiniteScrollingCurrentNbRows;

    /**
     * Available only if "isInfiniteScrolling" is enabled.
     * Are there any more rows to show?
     */
    @track isInfiniteScrollingMoreData = false;

    /**
     * Are we gonna use the dependency viewer in this table?
     * true if one of the columns are of type "dependencyViewer"
     * False by default.
     */
    @track usesDependencyViewer = false;
    
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
    @track tableClasses = 'slds-table slds-table_bordered';

    /**
     * Do you need the headers to stick on top of the screen even if you scroll down?
     */
    @api isStickyHeaders = false;
        
    /**
     * Internal array of columns
     */
    #columns;

    /**
     * Internal array of all rows
     */
    #allRows;

    /**
     * Array of all visible rows (filter and infiniteScrolling)
     */
    @track visibleRows;

    /**
     * Internal property that indicates the current column index which is used by the sort method
     */
    #sortingColumnIndex;

    /**
     * Internal property that indicates the current order which is used by the sort method
     */
    #sortingOrder;

    /**
     * Label of the field the table is sorted by
     */
    @track sortingField

    /**
     * Order of the sorting (ascending or descending)
     */
    @track sortingOrder

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
                _columns.push({ label: '#', type: TYPE_INDEX });
            }
            if (this.showScoreColumn === true) {
                _columns.push({ label: 'Score', type: TYPE_SCORE, data: { value: 'badScore' }, sorted: SORT_ORDER_DESC });
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
                    cssClass: HEADER_CSSCLASS(c, this.isStickyHeaders),
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
     * Setter for the rows (it will set the internal <code>#allRows</code> property).
     * 
     * @param {Array<any>} rows 
     */
    @api set rows(rows) {
        if (!rows) return;

        this.nbAllRows = rows.length || 0;
        this.isDataEmpty = (this.nbAllRows === 0);
        if (this.isInfiniteScrolling === true) {
            this.infiniteScrollingCurrentNbRows = this.infiniteScrollingInitialNbRows;
        }
        this.nbBadRows = 0;
        this.#allRows = rows.map((r, i) => { 
            // Initiate the row
            const row = { 
                key: i, 
                index: i+1,
                cssClass: ROW_CSSCLASS(r, this.showScoreColumn),
                score: r.badScore,
                cells: []
            };
            if (row.score > 0) {
                this.nbBadRows++;
            }
            // Iterate over the columns to prepare the cells of that row
            this.#columns.forEach((c, j) => {
                // By default the reference used in the properties is the row itself
                // Unless the 'ref' property in column.data is specified 
                let ref = r;
                if (c.data?.ref) {
                    c.data?.ref.split('.').forEach((p) => { ref = ref[p]; });
                }
                // Prepare the cell information
                const cell = { 
                    key: `${i}.${j}`,
                    cssClass: CELL_CSSCLASS(r, c),
                    data: {}
                };
                cell[c.typeProperty] = true;
                if (c.isIndex === true || c.isScore === true) {
                    cell.data.value = '';
                } else if (c.isIterative === true) {
                    cell.data.values = ref?.map((r) => CELL_PREPARE(r, c)) || [];
                } else {
                    CELL_PREPARE(ref, c, cell);
                }
                row.cells.push(cell);
            });
            return row; 
        });
        this._sortAllRows();
        this._filterAllRows();
        this._setVisibleRows();
    }

    /**
     * Getter for the rows (it will return the internal <code>#allRows</code> property)
     * 
     * @return {Array<any>} rows 
     */
    get rows() {
        return this.#allRows;
    }
    
    /**
     * Handler when a user click on the "Load more rows..." button
     */
    handleLoadMoreData() {
        const nextNbRows = Number.parseInt(this.infiniteScrollingCurrentNbRows) + Number.parseInt(this.infiniteScrollingAdditionalNbRows);
        this.infiniteScrollingCurrentNbRows = nextNbRows < this.nbAllRows ? nextNbRows : this.nbAllRows;
        this._setVisibleRows();
    }

    /**
     * Handler when a user click on the "Load all rows..." button
     */
    handleLoadAllData() {
        this.infiniteScrollingCurrentNbRows = this.nbAllRows;
        this._setVisibleRows();
    }

    /**
     * Handler when a user type a search text in the appropriate input text field
     * 
     * @param {Event} event 
     */
    handleSearchInputChanged(event) {
        this.#filteringSearchInput = event.target.value;
        this._filterAllRows();
        this._setVisibleRows();
    }

    /**
     * Handler when a user clicks on a header of the table
     * 
     * @param {Event} event 
     */
    handleSortColumnClick(event) {
        this.#sortingColumnIndex = parseInt(event.target.getAttribute('aria-colindex'), 10);
        this.#sortingOrder = SORT_ORDER_ASC;
        this.#columns.forEach((column) => {
            if (column.index === this.#sortingColumnIndex) {
                if (!column.sorted || column.sorted === SORT_ORDER_DESC) {
                    this.#sortingOrder = column.sorted = SORT_ORDER_ASC;
                } else {
                    this.#sortingOrder = column.sorted = SORT_ORDER_DESC;
                }
            } else {
                delete column.sorted;
            }
            column.cssClass = HEADER_CSSCLASS(column, this.isStickyHeaders);
        });
        this._sortAllRows();
        this._setVisibleRows();
    }

    /**
     * Handler when a user click on the dependency link to open the modal dialog
     * 
     * @param {Event} event 
     */
    handleViewDependency(event) {
        const viewer = this.template.querySelector('c-orgcheck-dependency-viewer');
        viewer.open(event.target.whatid, event.target.whatname, event.target.dependencies);
    }

    /**
     * Internal filter method which takes into account the <code>#filteringSearchInput</code> property
     */
    _filterAllRows() {
        const searchInput = this.#filteringSearchInput;
        if (searchInput && searchInput.length > 2) {
            this.isFilterOn = true;
            const s = searchInput.toUpperCase();
            this.nbFilteredRows = 0;
            this.#allRows.forEach((row) => {
                const rowIsVisible = (
                    row.cells.findIndex((cell) => {
                        return Object.values(cell.data).findIndex((value) => {
                            return String(value).toUpperCase().indexOf(s) >= 0;
                        }) >= 0;
                    }) >= 0
                );
                if (rowIsVisible === true) {
                    delete row.isInvisible;
                    row.index = ++this.nbFilteredRows;
                } else {
                    row.isInvisible = true;
                }
            });
            this.isFilteredDataEmpty = (this.nbFilteredRows === 0);
        } else {
            this.isFilterOn = false;
            this.isFilteredDataEmpty = false;
            this.#allRows.forEach((row, i) => { 
                delete row.isInvisible;
                row.index = i+1;
            });
        }
    }

    /**
     * Internal sort method which takes into account the <code>#sortingColumnIndex</code> and <code>sortingOrder</code> properties
     */
    _sortAllRows() {
        if (this.#sortingColumnIndex === undefined) return;
        const columnIndex = this.#sortingColumnIndex;
        const iOrder = this.#sortingOrder === SORT_ORDER_ASC ? 1 : -1;
        const isIterative = this.#columns[columnIndex].isIterative;
        let value1, value2;
        let index = 0;
        this.#allRows.sort((row1, row2) => {
            if (isIterative === true) {
                value1 = row1.cells[columnIndex].data.values.length || undefined;
                value2 = row2.cells[columnIndex].data.values.length || undefined;
            } else {
                value1 = row1.cells[columnIndex].data.value;
                value2 = row2.cells[columnIndex].data.value;
            }
            if (value1 && value1.toUpperCase) value1 = value1.toUpperCase();
            if (value2 && value2.toUpperCase) value2 = value2.toUpperCase();
            if (!value1 && value1 !== 0) return 1;
            if (!value2 && value2 !== 0) return -1;
            return (value1 < value2 ? -iOrder : iOrder);
        }).forEach((row) => { 
            if (!row.isInvisible) {
                row.index = ++index; 
            }
        });
        this.sortingField = this.#columns[columnIndex].label;
        this.sortingOrder = this.#sortingOrder === SORT_ORDER_ASC ? 'ascending' : 'descending';
    }

    /**
     * Internal setter for visible rows array
     */
    _setVisibleRows() {
        const allVisibleRows = this.#allRows.filter((row) => !row.isInvisible);
        if (this.isInfiniteScrolling === true && allVisibleRows) {
            this.isInfiniteScrollingMoreData = this.infiniteScrollingCurrentNbRows < allVisibleRows.length;
        }
        if (this.isInfiniteScrollingMoreData === true) {
            this.visibleRows = allVisibleRows.slice(0, this.infiniteScrollingCurrentNbRows);
        } else {
            this.visibleRows = allVisibleRows;
        }
    }
}