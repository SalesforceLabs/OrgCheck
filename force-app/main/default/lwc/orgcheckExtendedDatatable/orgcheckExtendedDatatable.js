import { LightningElement, api, track } from 'lwc';
import * as ocui from './libs/orgcheck-ui.js';

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
     * @description Is filter gives no data?
     * @type {boolean}
     */
    isFilteredDataEmpty;
    
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
     * @description Column headers -- tracked so any change in css can be reflected in table
     * @type {Array<{label: string, index: number, cssClass: string, isIterative: boolean}>}
     * @private
     */
    @track columnHeaders = [];

    /**
     * @description Array of all visible rows (filter and infiniteScrolling)
     * @type {array}
     */
    visibleRows;

    /**
     * @description Is the table sorted implicitely or explicitely?
     * @type {boolean}
     */
    get isSorted() {
        return this._sortingIndex !== undefined;
    }

    /**
     * @description Label of the field the table is sorted by
     * @type {string}
     */
    get sortingField() {
        return this._tableDefinition.columns[this._sortingIndex].label;
    }

    /**
     * @description Order of the sorting (ascending or descending)
     * @type {string}
     */
    get sortingOrder() {
        return this._sortingOrder === ocui.SortOrder.ASC ? 'ascending' : 'descending';
    }




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
     * @description Internal array of all rows
     * @type {Array}
     * @private
     */
    _allRows;

    /**
     * @description Table definition with ordering ad columns information
     * @type {ocui.Table}
     * @private
     */
    _tableDefinition;

    /**
     * @description Index of the current column used to sort data
     * @type {number}
     */
    _sortingIndex;

    /**
     * @description Current order used to sort data
     * @type {string}
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
     * @param {ocui.Table} tableDefinition 
     */
    @api set tableDefinition(tableDefinition) {

        // In case the table definition is not set just skip that method
        if (!tableDefinition) return;

        // Set the tableDefinition
        this._tableDefinition = tableDefinition;
        this._sortingIndex = tableDefinition.orderIndex;
        this._sortingOrder = tableDefinition.orderSort;
        this.columnHeaders = tableDefinition.columns.map((c, i) => {
            if (c.type === ocui.ColumnType.SCR) {
                // if we show score column, bad cell will be highlighted as well so that we can understand the score (= nb of bad cells)
                this._showScoreColumn = true; 
            }
            if (c.type === ocui.ColumnType.DEP && this.usesDependencyViewer === false) {
                this.usesDependencyViewer = true;
            };
            return {
                index: i,
                label: c.label,
                isIterative: c.type === ocui.ColumnType.TXTS || c.type === ocui.ColumnType.URLS || c.type === ocui.ColumnType.OBJS,
                cssClass: (this._sortingIndex === i ? `sorted ${this._sortingOrder === ocui.SortOrder.ASC ? 'sorted-asc' : 'sorted-desc'} ` : '') + 
                          (this.isStickyHeaders ? 'sticky ': '') + 
                          (c['orientation'] === ocui.Orientation.VERTICAL ? 'vertical ' : ' ')
            }
        });
    }

    get tableDefinition() {
        return this._tableDefinition;
    }
    
    /**
     * @description Setter for the rows (it will set the internal <code>_allRows</code> property).
     * @param {Array<any>} rows 
     */
    @api set rows(rows) {

        // Some sanity checks
        if (!this._tableDefinition) return;
        if (!this.columnHeaders) return;
        if (!rows) return;

        // All rows (no filter no scrolling etc... all of the rows
        this.nbAllRows = rows.length || 0;
        
        // If infinite scrolling is set then set the starting nb of rows to display (will be incremented later when we hit the "more rows" button)
        if (this.isInfiniteScrolling === true) {
            // @api decorator returns a string, that's why we are using parseInt()
            this.infiniteScrollingCurrentNbRows = Number.parseInt(this.infiniteScrollingInitialNbRows, 10);
        }
        
        // Parse the rows
        this.nbBadRows = 0;
        this._allRows = ocui.RowsFactory.create(
            this.tableDefinition, 
            rows, 
            (row, isBad) => { 
                if (isBad === true) {
                    this.nbBadRows++;
                    row.cssClass = 'bad';
                }
            }, 
            (cell, isBad) => {
                if (isBad === true) {
                    cell.cssClass = 'bad';
                }
            }
        );
        this._sortAllRows();
        this._filterAllRows();
        this._setVisibleRows();
    }

    /**
     * @description Getter for the rows (it will return the internal <code>_allRows</code> property)
     * @return {Array<any>} rows 
     */
    get rows() {
        return this._allRows;
    }

    /**
     * @description Convert this table into an Excel data
     * @returns {Array<ocui.ExportedTable>}
     */ 
    get exportedRows() {
        if (this._tableDefinition && this._tableDefinition.columns && this._allRows) {
            return [ ocui.RowsFactory.export(this._tableDefinition, this._allRows, this.exportBasename) ];
        }
        return [];
    }



    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // User Experience Handlers
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Handler when a user click on the "Load more rows..." button
     */
    handleLoadMoreData() {
        // @api decorator returns a string, that's why we are using parseInt()
        const nextNbRows = this.infiniteScrollingCurrentNbRows + Number.parseInt(this.infiniteScrollingAdditionalNbRows, 10);
        this.infiniteScrollingCurrentNbRows = nextNbRows < this.nbAllRows ? nextNbRows : this.nbAllRows;
        this._setVisibleRows();
    }

    /**
     * @description Handler when a user click on the "Load all rows..." button
     */
    handleLoadAllData() {
        this.infiniteScrollingCurrentNbRows = this.nbAllRows;
        this._setVisibleRows();
    }

    /**
     * @description Handler when a user type a search text in the appropriate input text field
     * @param {Event} event 
     */
    handleSearchInputChanged(event) {
        this._filteringSearchInput = event.target['value'];
        this._filterAllRows();
        this._setVisibleRows();
    }

    /**
     * @description Handler when a user clicks on a header of the table
     * @param {Event} event 
     */
    handleSortColumnClick(event) {

        // Get the old and new columns index
        const previousSortingColumnIndex = this._sortingIndex;
        const newSortingColumnIndex = parseInt(event.target['getAttribute']('aria-colindex'), 10);

        // Set the new sorting column index
        this._sortingIndex = newSortingColumnIndex;

        // Setting the sorting order accordingly
        if (previousSortingColumnIndex === newSortingColumnIndex) { 
            // If the previous and new are the same, we just switch the order!
            if (this._sortingOrder === ocui.SortOrder.ASC) {
                this._sortingOrder = ocui.SortOrder.DESC;
            } else {
                this._sortingOrder = ocui.SortOrder.ASC
            }
        } else { 
            // if they are different, by default, the ordering is ASC
            this._sortingOrder = ocui.SortOrder.ASC;
        }

        // Remove the style for the old column
        const previousColumn = this.columnHeaders[previousSortingColumnIndex];
        if (previousColumn) {
            previousColumn.cssClass = previousColumn.cssClass.replaceAll(/(sorted sorted-asc|sorted sorted-desc)/g, '');
        }

        // Add the sorting style to the new column
        const newColumn = this.columnHeaders[newSortingColumnIndex];
        if (newColumn) {
            newColumn.cssClass += (this._sortingOrder === ocui.SortOrder.ASC ? 'sorted sorted-asc' : 'sorted sorted-desc');
        }

        this._sortAllRows();
        this._setVisibleRows();
    }

    /**
     * @description Handler when a user click on the dependency link to open the modal dialog with dependency diagram
     * @param {Event} event 
     */
    handleViewDependency(event) {
        /** @type {any} */
        const viewer = this.template.querySelector('c-orgcheck-dependency-viewer');
        viewer.open(event.target['whatId'], event.target['whatName'], event.target['dependencies']);
    }

    /**
     * @description Handler when a user click on the score link to open the modal dialog with score explanation
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
     * @description Internal filter method which takes into account the <code>_filteringSearchInput</code> property
     * @private
     */
    _filterAllRows() {
        ocui.RowsFactory.filter(this._allRows, this._filteringSearchInput);
    }

    /**
     * @description Internal sort method which takes into account the <code>_sortingColumnIndex</code> and <code>sortingOrder</code> properties
     * @private
     */
    _sortAllRows() {
        ocui.RowsFactory.sort(this._tableDefinition, this._allRows, this._sortingIndex, this._sortingOrder);
    }

    /**
     * @description Internal setter for visible rows array
     * @private
     */
    _setVisibleRows() {
        if (this._allRows) {
            const allVisibleRows = this._allRows.filter((row) => row.isVisible === true);
            this.isFilteredDataEmpty = this._filteringSearchInput && allVisibleRows.length === 0;
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
}