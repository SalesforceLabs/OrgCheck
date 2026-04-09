import { LightningElement, api, track } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
import { loadScript } from 'lightning/platformResourceLoader';


export default class OrgcheckExtentedDatatable extends LightningElement {

    /**
     * @description Flag to know if the api was intiated
     * @type {boolean}
     * @private
     */ 
    _apiInitialized = false;

    /**
     * @description Called when it's about to render the component
     */
    renderedCallback() {
        // Load only if the api is not already initilized
        if (this._apiInitialized === false) {
            loadScript(this, OrgCheckStaticResource + '/js/orgcheck.js')
                .then(() => {
                    this._apiInitialized = true;
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    }

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
     * @description The source data for the export functionality
     * @type {ExportedTable | ExportedTable[]}
     */
    @api exportSource = undefined;

    /**
     * @description Do you want the table to use all the horizontal space or not? False by default.
     * @type {boolean}
     */
    @api dontUseAllSpace = false;

    /**
     * @description Let the table be scrollable (or not) if its width to too big for the container.
     * @type {boolean}
     */
    @api dontBeScrollable = false;

    /**
     * @description Do you need the headers to stick on top of the screen even if you scroll down?
     * @type {boolean}
     */
    @api isStickyHeaders = false;

    /**
     * @description Do you want all cells to be wrapped (with line breaks) if the content is too long? False by default.
     * @type {boolean}
     */ 
    @api isAllCellWrapped = false;



    
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Properties that are used in the UI/HTML template
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description CSS classes for the table container
     * @type {string}
     */
    get tableContainerClasses() {
        return `${this.dontUseAllSpace === true ? 'unsettablewidth' : ''} `+
               `${this.dontBeScrollable === false ? 'slds-scrollable autowidth' : ''} `+
               `${this.isStickyHeaders === true ? 'stickytable' : ''}`;
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
    nbAllRows;

    /**
     * @description Number of rows that match the filter
     * @type {number}
     */
    nbFilteredRows;

    /**
     * @description Total number of rows that have a bad score (>0)
     * @type {number}
     */
    nbBadRows;
    
    /**
     * @description Is the search active and records are filtered
     * @type {boolean}
     */
    isFilterOn;

    /**
     * @description Is filter gives no data?
     * @type {boolean}
     */
    isFilteredDataEmpty;

    /**
     * @description Is the table sorted implicitely or explicitely?
     * @type {boolean}
     */
    isSorted;

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
     * @type {{label: string, cssClass: string, isIterative: boolean}[]}
     */
    @track columnHeaders = [];

    /**
     * @description Array of all visible rows (filter and infiniteScrolling)
     * @type {Array}
     */
    visibleRows;

    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Internal/private properties
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Internal properties without LWC reactivity
     * @property allRows {Array} Array of all rows (even the one that are not visible because of the filter or infinite scrolling)
     * @property table {Object} The whole table information as it is set by the caller with the "table" property (headers, rows, etc...)
     * @property filteringSearchInput {string} Current value of the search input which is used by the filter method
     */
    _private_properties = {
        table: undefined,
        allRows: undefined,
        filteringSearchInput: undefined,
        sortingOrder: undefined,
    }

    /**
     * @description Set the table information: headers, rows, etc...
     * @param {{ definition: { columns: any[]; }; rows: any[]; }} table
     */
    @api set table(table) {

        // Set the column headers based on the table definition
        // We add some properties to the headers
        this.columnHeaders = table?.definition?.columns.map((c, i) => {
            if (c.type === 'dependencies' && this.usesDependencyViewer === false) {
                this.usesDependencyViewer = true;
            };
            return {
                index: (i + 1),
                label: c.label,
                isIterative: c.type === 'texts' || c.type === 'ids' || c.type === 'objects',
                cssClass: (table?.orderIndex === i ? `sorted ${table?.orderSort === 'asc' ? 'sorted-asc' : 'sorted-desc'} ` : '') + 
                          (this.isStickyHeaders ? 'sticky ': '') + 
                          // eslint-disable-next-line dot-notation
                          (c['orientation'] === 'vertical' ? 'vertical ' : ' ')
                          // Note: can't use instanceof on 'c'
            }
        }) ?? [];
        
        // If infinite scrolling is set then set the starting nb of rows to 
        // display (will be incremented later when we hit the "more rows" button)
        if (this.isInfiniteScrolling === true) {
            // @api decorator returns a string, that's why we are using parseInt()
            this.infiniteScrollingCurrentNbRows = Number.parseInt(this.infiniteScrollingInitialNbRows, 10);
        }
        
        // Parse the rows and add some css style and keys
        const allRows = table?.rows.map((row, rowIndex) => ({
            key: `${rowIndex}`,
            cssClass: row.score > 0 ? 'bad' : '',
            index: row.index,
            score: row.score,
            name: row.name,
            badFields: row.badFields ? [... row.badFields] : [],
            badReasonIds: row.badReasonIds ? [... row.badReasonIds] : [],
            isVisible: row.isVisible ?? true,
            cells: row.cells.map((cell, cellIndex) => {
                const isCellBad = row.badFields?.includes(table?.definition?.columns[cellIndex]?.label) ?? false;
                return {
                    key: `${rowIndex}.${cellIndex}`,
                    cssClass: `${this.isAllCellWrapped === true ? 'wrapped' : ''} ${isCellBad ? 'bad' : ''}`,
                    ...cell
                }
            }) ?? [],
        })) ?? []; 

        this._private_properties.allRows = allRows;
        this._private_properties.table = table ? { ...table, rows: allRows } : undefined;

        // Sort, filter and set the visible rows
        this._sortAllRows();
        this._filterAllRows();
        this._setVisibleRows();
        this._synchronizeCounters();
    }

    /**
     * @description Get the table information: headers, rows, etc...
     */
    get table() {
        return this._private_properties.table;
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
        this._synchronizeCounters();
    }

    /**
     * @description Handler when a user click on the "Load all rows..." button
     */
    handleLoadAllData() {
        this.infiniteScrollingCurrentNbRows = this.nbAllRows;
        this._setVisibleRows();
        this._synchronizeCounters();
    }

    /**
     * @description Handler when a user type a search text in the appropriate input text field
     * @param {Event | any} event - The event information
     */
    handleSearchInputChanged(event) {
        this._private_properties.filteringSearchInput = event.target.value;
        this._filterAllRows();
        this._setVisibleRows();
        this._synchronizeCounters();
    }

    /**
     * @description Handler when a user clicks on a header of the table
     * @param {Event | any} event - The event information
     */
    handleSortColumnClick(event) {

        // Get the old and new columns index
        const previousSortingColumnIndex = this._private_properties.table.orderIndex;
        const newSortingColumnIndex = parseInt(event.target.getAttribute('aria-colindex'), 10) - 1; // aria-colindex is 1-based index, we need 0-based index

        // Set the new sorting column index
        this._private_properties.table.orderIndex = newSortingColumnIndex;

        // Setting the sorting order accordingly
        if (previousSortingColumnIndex === newSortingColumnIndex) { 
            // If the previous and new are the same, we just switch the order!
            if (this._private_properties.table.orderSort === 'asc') {
                this._private_properties.table.orderSort = 'desc';
            } else {
                this._private_properties.table.orderSort = 'asc'
            }
        } else { 
            // if they are different, by default, the ordering is ASC
            this._private_properties.table.orderSort = 'asc';
        }

        // Remove the style for the old column
        const previousColumn = this.columnHeaders[previousSortingColumnIndex];
        if (previousColumn) {
            previousColumn.cssClass = previousColumn.cssClass.replaceAll(/(sorted sorted-asc|sorted sorted-desc)/g, '');
        }

        // Add the sorting style to the new column
        const newColumn = this.columnHeaders[newSortingColumnIndex];
        if (newColumn) {
            newColumn.cssClass += (this._private_properties.table.orderSort === 'asc' ? 'sorted sorted-asc' : 'sorted sorted-desc');
        }

        this._sortAllRows();
        this._setVisibleRows();
        this._synchronizeCounters();
    }

    /**
     * @description Handler when a user click on the dependency link to open the modal dialog with dependency diagram
     * @param {Event | any} event - The event information
     */
    handleViewDependency(event) {
        const viewer = this.template.querySelector('c-orgcheck-dependency-viewer');
        viewer.open(event.target.whatId, event.target.whatName, event.target.dependencies);
    }

    /**
     * @description Handler when a user click on the score link to open the modal dialog with score explanation
     * @param {Event | any} event - The event information
     */
    handleViewScore(event) {
        this.dispatchEvent(new CustomEvent('viewscore', { detail: { 
            whatId: event.target.whatId,
            whatName: event.target.whatName,
            score: event.target.score,
            reasonIds: event.target.reasonIds, 
            fields: event.target.fields
        }}));
    }



    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------
    // Internal methods
    // ----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @description Internal method to synchronize all the counters (nbAllRows, nbFilteredRows, nbBadRows, etc...) with the current table information
     * @private
     */
    _synchronizeCounters() {
        this.nbAllRows = this._private_properties.table?.rows?.length ?? 0;
        this.nbFilteredRows = this._private_properties.table?.nbFilteredRows ?? 0;
        this.nbBadRows = this._private_properties.table?.nbBadRows ?? 0
        this.isFilterOn = this._private_properties.table?.isFilterOn ?? false;
        this.isFilteredDataEmpty = this._private_properties.table?.isFilteredDataEmpty ?? false;
        this.isSorted =  this._private_properties.table?.orderIndex !== undefined;
        this.sortingField = this._private_properties.table?.definition.columns[this._private_properties.table?.orderIndex]?.label;
        this.sortingOrder = this._private_properties.table?.orderSort === 'asc' ? 'ascending' : 'descending';
    }


    /**
     * @description Internal filter method which takes into account the <code>_filteringSearchInput</code> property
     * @private
     */
    _filterAllRows() {
        __orgcheck__Get()?.TableUtils.filter(
            this._private_properties.table, 
            this._private_properties.filteringSearchInput
        );
    }

    /**
     * @description Internal sort method which takes into account the <code>_sortingColumnIndex</code> and <code>sortingOrder</code> properties
     * @private
     */
    _sortAllRows() {
        __orgcheck__Get()?.TableUtils.sort(
            this._private_properties.table, 
            this._private_properties.table?.orderIndex,
            this._private_properties.table?.orderSort
        );
    }

    /**
     * @description Internal setter for visible rows array
     * @private
     */
    _setVisibleRows() {
        const allVisibleRows = this._private_properties.allRows?.filter((row) => row.isVisible === true) ?? [];
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

const __orgcheck__Get = () => {
    return (typeof window !== 'undefined' ? window?.orgcheck : globalThis?.orgcheck ?? null)
}
