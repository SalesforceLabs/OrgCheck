import { LightningElement, api } from 'lwc';

export default class OrgcheckExtentedDatatable extends LightningElement {

    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Properties set by the caller to change some behaviors of this component
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description If no data then this message will appear instead of the table
     * @type {string}
     */
    @api emptyMessage;

    /**
     * @description Are the statistics going to be shown on top of the table?
     * @type {boolean}
     */
    @api showStatistics = false;

    /**
     * @description Do you want the infinite scrolling feature to be enabled? False by default
     * @type {boolean}
     */
    @api isInfiniteScrolling = false;
    
    /**
     * @description Available only if "isInfiniteScrolling" is enabled. After you set rows, how many maximum rows you want to start showing?
     *              Note: type is string because the value comes from the "api" decorator
     * @type {string}
     */
    @api infiniteScrollingInitialNbRows;
    
    /**
     * @description Available only if "isInfiniteScrolling" is enabled. How many rows do you want to show after hitting the button "show more..."?
     *              Note: type is string because the value comes from the "api" decorator
     * @type {string}
     */
    @api infiniteScrollingAdditionalNbRows;

    /**
     * @description Do you want the search input to be displayed? And the filter to be enabled? False by default.
     * @type {boolean}
     */
    @api showSearch = false;

    /**
     * @description Do you want to show the ROW NUMBER column in the table? No need to add it to the columns, flag this property to true. False by default.
     * @type {boolean}
     */
    @api showRowNumberColumn = false;

    /**
     * @description Do you want to show the export button? False by default.
     * @type {boolean}
     */
    @api showExportButton = false;

    /**
     * @description What is the name fo the exported file? Default name is "Data".
     * @type {string}
     */
    @api exportBasename = 'Data';

    /**
     * @description Do you want the table to use all the horizontal space or not? False by default.
     * @type {boolean}
     */
    @api dontUseAllSpace = false;
    
    /**
     * @description Do you need the headers to stick on top of the screen even if you scroll down?
     * @type {boolean}
     */
    @api isStickyHeaders = false;


    
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Properties that are used in the UI/HTML template
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description CSS classes for the table
     * @type {string}
     */
    get tableClasses() {
        return `slds-table slds-table_bordered ${this.dontUseAllSpace === true?'dontuseallspace':''}`;
    }

    /**
     * @description Is there no records at all to display?
     * @type {boolean}
     */
    get isDataEmpty() {
        return this.nbAllRows === 0;
    }

    /**
     * @description Total number of all rows (even if the filter is on)
     * @type {number}
     */
    nbAllRows = 0;

    /**
     * @description Number of rows that match the filter
     * @type {number}
     */
    nbFilteredRows = 0;

    /**
     * @description Total number of rows that have a bad score (>0)
     * @type {number}
     */
    nbBadRows = 0;
    
    /**
     * @description Is the search active and records are filtered
     * @type {boolean}
     */
    isFilterOn = false;
    
    /**
     * @description How many rows are currently shown?
     * @type {number}
     */
    infiniteScrollingCurrentNbRows;

    /**
     * @description Available only if "isInfiniteScrolling" is enabled. Are there any more rows to show?
     * @type {boolean}
     */
    isInfiniteScrollingMoreData = false;

    /**
     * @description Are we gonna use the dependency viewer in this table? true if one of the columns are of type "dependencyViewer". False by default.
     * @type {boolean}
     */
    usesDependencyViewer = false;

    /**
     * @description Array of all visible rows (filter and infiniteScrolling)
     * @type {array}
     */
    visibleRows;

    /**
     * @description Is the table sorted implicitely or explicitely?
     * @type {boolean}
     */
    isSorted = false;

    /**
     * @description Label of the field the table is sorted by
     * @type {string}
     */
    sortingField;

    /**
     * @description Order of the sorting (ascending or descending)
     * @type {string}
     */
    sortingOrder;





    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Internal/private properties
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Do we show the score column?
     * @type {boolean}
     * @private
     */
    _showScoreColumn = false;
        
    /**
     * @description Internal array of columns
     * @type {Array}
     * @private
     */
    _columns;

    /**
     * @description Internal array of all rows
     * @type {Array}
     * @private
     */
    _allRows;

    /**
     * @description Internal property that indicates the current column index which is used by the sort method
     * @type {number}
     * @private
     */
    _sortingColumnIndex;

    /**
     * @description Internal property that indicates the current order which is used by the sort method
     * @type {string}
     * @private
     */
    _sortingOrder;

    /**
     * @description Internal property that indicate the current search input index which is used by the filter method
     * @type {string}
     * @private
     */
    _filteringSearchInput;

    /**
     * @description Setter for the columns (it will set the internal <code>_columns</code> property)
     * @param {Array<any>} columns 
     */
    @api set columns(columns) {
        if (columns) {
            this.usesDependencyViewer = false;
            this._showScoreColumn = false;
            const _columns = [];
            if (this.showRowNumberColumn === true) {
                _columns.push({ label: '#', type: TYPE_INDEX });
            }
            _columns.push(...columns);
            this._columns = _columns.map((c, i) => { 
                if (c.type === TYPE_SCORE) {
                    this._showScoreColumn = true;
                }
                if (c.sorted) {
                    this._sortingColumnIndex = i;
                    this._sortingOrder = c.sorted;
                }
                if (this.usesDependencyViewer === false && c.type === TYPE_DEPENDENCIES) {
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
     * Getter for the columns (it will return the internal <code>_columns</code> property)
     * 
     * @return {Array<any>} columns 
     */
    get columns() {
        return this._columns;
    }

    /**
     * Setter for the rows (it will set the internal <code>_allRows</code> property).
     * 
     * @param {Array<any>} rows 
     */
    @api set rows(rows) {
        if (!this._columns) return;
        if (!rows) return;

        this.nbAllRows = rows.length || 0;
        if (this.isInfiniteScrolling === true) {
            // @api decorator returns a string, that's why we are using parseInt()
            this.infiniteScrollingCurrentNbRows = Number.parseInt(this.infiniteScrollingInitialNbRows, 10);
        }
        this.nbBadRows = 0;
        this._allRows = rows.map((r, i) => { 
            // Initiate the row
            const row = { 
                key: i, 
                index: i+1,
                cssClass: ROW_CSSCLASS(r, this._showScoreColumn),
                score: r.badFields?.length || 0,
                badFields: r.badFields,
                badReasonIds: r.badReasonIds,
                cells: []
            };
            if (row.score > 0) {
                this.nbBadRows++;
            }
            // Iterate over the columns to prepare the cells of that row
            this._columns.forEach((c, j) => {
                // By default the reference used in the properties is the row itself
                // Unless the 'ref' property in column.data is specified 
                let ref = r;
                if (c.data?.ref) {
                    c.data?.ref.split('.').forEach((p) => { if (ref) ref = ref[p]; });
                }
                // Prepare the cell information
                const cell = { 
                    key: `${i}.${j}`,
                    cssClass: CELL_CSSCLASS(r, c),
                    data: {}
                };
                cell[c.typeProperty] = true;
                if (c.isIterative === true) {
                    cell.data.values = ref?.map((rr) => CELL_PREPARE(row.score, rr, c)) || [];
                } else {
                    CELL_PREPARE(row.score, ref, c, cell);
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
     * Getter for the rows (it will return the internal <code>_allRows</code> property)
     * 
     * @return {Array<any>} rows 
     */
    get rows() {
        return this._allRows;
    }
    
    get exportedRows() {
        if (!this._columns || !this._allRows) return [];
        return [
            {
                header: 'Data',
                columns: this._columns.map(c => c.label),
                rows: this._allRows.map(row => row.cells.map(cell => {
                    if (cell.isIndex) return row.index;
                    if (cell.data.values) return JSON.stringify(cell.data.values.map(v => v.data.decoratedValue ?? v.data.value));
                    if (cell.data.value) return cell.data.decoratedValue ?? cell.data.value;
                    return '';
                }))
            }
        ];
    }




    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // User Experience Handlers
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * Handler when a user click on the "Load more rows..." button
     */
    handleLoadMoreData() {
        // @api decorator returns a string, that's why we are using parseInt()
        const nextNbRows = this.infiniteScrollingCurrentNbRows + Number.parseInt(this.infiniteScrollingAdditionalNbRows, 10);
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
        this._filteringSearchInput = event.target['value'];
        this._filterAllRows();
        this._setVisibleRows();
    }

    /**
     * Handler when a user clicks on a header of the table
     * 
     * @param {Event} event 
     */
    handleSortColumnClick(event) {
        this._sortingColumnIndex = parseInt(event.target['getAttribute']('aria-colindex'), 10);
        this._sortingOrder = SORT_ORDER_ASC;
        this._columns.forEach((column) => {
            if (column.index === this._sortingColumnIndex) {
                if (!column.sorted || column.sorted === SORT_ORDER_DESC) {
                    this._sortingOrder = column.sorted = SORT_ORDER_ASC;
                } else {
                    this._sortingOrder = column.sorted = SORT_ORDER_DESC;
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
     * Handler when a user click on the dependency link to open the modal dialog with dependency diagram
     * 
     * @param {Event} event 
     */
    handleViewDependency(event) {
        /** @type {any} */
        const viewer = this.template.querySelector('c-orgcheck-dependency-viewer');
        viewer.open(event.target['whatId'], event.target['whatName'], event.target['dependencies']);
    }

    /**
     * Handler when a user click on the score link to open the modal dialog with score explanation
     * 
     * @param {Event} event 
     */
    handleViewScore(event) {
        this.dispatchEvent(new CustomEvent('viewscore', { detail: { 
            whatId: event.target['whatId'],
            whatName: event.target['whatName'],
            score: event.target['score'],
            reasonIds: event.target['reasonIds'], 
            fields: event.target['fields']
        }}));
    }



    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Internal methods
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * Internal filter method which takes into account the <code>_filteringSearchInput</code> property
     */
    _filterAllRows() {
        const searchInput = this._filteringSearchInput;
        if (searchInput && searchInput.length > 2) {
            this.isFilterOn = true;
            const s = searchInput.toUpperCase();
            this.nbFilteredRows = 0;
            this._allRows.forEach((row) => {
                if (ARRAY_MATCHER(row.cells, s) === true) {
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
            this._allRows.forEach((row, i) => { 
                delete row.isInvisible;
                row.index = i+1;
            });
        }
    }

    /**
     * Internal sort method which takes into account the <code>_sortingColumnIndex</code> and <code>sortingOrder</code> properties
     */
    _sortAllRows() {
        if (this._sortingColumnIndex === undefined) {
            this.isSorted = false;
            return;
        }
        const columnIndex = this._sortingColumnIndex;
        const iOrder = this._sortingOrder === SORT_ORDER_ASC ? 1 : -1;
        const isIterative = this._columns[columnIndex].isIterative;
        let value1, value2;
        let index = 0;
        this._allRows.sort((row1, row2) => {
            if (isIterative === true) {
                value1 = row1.cells[columnIndex].data.values.length || undefined;
                value2 = row2.cells[columnIndex].data.values.length || undefined;
            } else {
                value1 = row1.cells[columnIndex].data.value;
                value2 = row2.cells[columnIndex].data.value;
            }
            if (value1 && value1.toUpperCase) value1 = value1.toUpperCase();
            if (value2 && value2.toUpperCase) value2 = value2.toUpperCase();
            if (!value1 && value1 !== 0) return iOrder;
            if (!value2 && value2 !== 0) return -iOrder;
            return (value1 < value2 ? -iOrder : iOrder);
        }).forEach((row) => { 
            if (!row.isInvisible) {
                row.index = ++index; 
            }
        });
        this.isSorted = true;
        this.sortingField = this._columns[columnIndex].label;
        this.sortingOrder = this._sortingOrder === SORT_ORDER_ASC ? 'ascending' : 'descending';
    }

    /**
     * Internal setter for visible rows array
     */
    _setVisibleRows() {
        const allVisibleRows = this._allRows.filter((row) => !row.isInvisible);
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


const TYPE_INDEX = 'index';
const TYPE_SCORE = 'score';
const TYPE_DEPENDENCIES = 'dependencyViewer';

const SORT_ORDER_ASC = 'asc';
const SORT_ORDER_DESC = 'desc';

const NUMBER_FORMATTER = Intl.NumberFormat();

const OBJECT_TO_STRING = (template, object) => {
    switch (typeof template) {
        case 'string':
            return template.replace(/{([A-Za-z0-9]+)(:(boolean|numeric)(:([^}]*))?)?}/g, function (_0, property, _1, type, _2, typeArg) {
                const value = (object === undefined || typeof object[property] === 'undefined') ? '' : object[property];
                if (type) {
                    switch (type) {
                        case 'numeric': return NUMBER_FORMATTER.format(value);
                        case 'boolean': {
                            if (typeArg) {
                                return typeArg.split(',', 2)[value === true ? 0 : 1];
                            }
                            return value;
                        }
                        default: return value;
                    }
                } 
                return value;
            });
        case 'function':
            return template(object);
        default:
            return object;
    }
}

const CELL_PREPARE = (rowScore, reference, column, cell = { data: {}}) => {
    if (reference && column.dataProperties.length > 0) {
        column.dataProperties.forEach((p) => {
            const refProperty = column.data[p];
            cell.data[p] = ((typeof refProperty === 'function') ? (refProperty(reference)) : (reference[refProperty]));
        });
    } else {
        cell.data.value = reference || '';
    }
    if (column.type === TYPE_SCORE) {
        cell.data.value = rowScore;
    }
    if (column.modifier) {
        if (column.modifier?.preformatted === true) {
            cell.isPreformatted = true;
        }
        if (column.modifier?.valueIfEmpty && IS_EMPTY(cell.data.value)) {
            cell.data.decoratedValue = column.modifier.valueIfEmpty;
            cell.isEmpty = true;
        } else if (column.modifier?.max && cell.data.value > column.modifier.max) {
            cell.data.decoratedValue = column.modifier.valueAfterMax;
            cell.isMaxReached = true;
        } else if (column.modifier?.min && cell.data.value < column.modifier.min) {
            cell.data.decoratedValue = column.modifier.valueBeforeMin;
            cell.isMinReached = true;
        } else if (column.modifier?.maximumLength && cell.data.value?.length > column.modifier.maximumLength) {
            cell.data.decoratedValue = cell.data.value.substr(0, column.modifier.maximumLength);
            cell.isValueTruncated = true;
        } else if (column.modifier?.template) {
            cell.data.decoratedValue = OBJECT_TO_STRING(column.modifier.template, cell.data.value);
        }
    }
    return cell;
}

const IS_EMPTY = (value) => {
    if (value === 0) return false;
    if (!value) return true;
    if (typeof value === 'string' && value.trim().length === 0) return true;
    return false;
}

const CELL_CSSCLASS = (row, cell) => {
    if (cell.type === TYPE_SCORE && row.badFields?.length > 0) return 'bad';
    return (row.badFields && row.badFields.some((field) => {
        // if the field is iterative then only consider the ref as the field name
        if (cell.isIterative === true && field === cell.data?.ref) return true;
        // if the name of field is the ref + property
        if (field === `${cell.data?.ref}.${cell.data?.value}`) return true;
        // if the field is the property of the current row
        if (cell.data?.ref === undefined && field === cell.data?.value) return true;
        // otherwise
        return false;
    })) ? 'bad' : '';
}

const ROW_CSSCLASS = (row, showScore) => {
    return ((showScore === true && row.badFields?.length > 0)? 'bad': '');
}

const HEADER_CSSCLASS = (column, isSticky) => {
    return  (column.sorted ? `sorted sorted-${column.sorted} ` : ' ') +
            (isSticky === true ? 'sticky ' : ' ') +
            (column.orientation === 'vertical' ? 'vertical': '');
}

const STRING_MATCHER = (value, searchingValue) => {
    return String(value).toUpperCase().indexOf(searchingValue) >= 0;
}

const ARRAY_MATCHER = (array, s) => {
    return array.findIndex((item) => {
        return Object.values(item.data).findIndex((property) => {
            if (Array.isArray(property)) {
                return ARRAY_MATCHER(property, s);
            }
            return STRING_MATCHER(property, s);
        }) >= 0;
    }) >= 0
}