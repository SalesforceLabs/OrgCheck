import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";
import { SalesforceMetadataTypes } from "src/api/core/orgcheck-api-salesforce-metadatatypes";

class AbstractWebLinksTableDefinitions implements Table {
    
    /**
     * @description Constructor to specify if this table is in a context of an object. 
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean) {
        this.columns = [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
            { label: 'Type',            type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Behavior',        type: ColumnType.TXT, data: { value: 'behavior' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',   type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
            { label: 'Ref. in Layout?', type: ColumnType.NUM, data: { value: `dependencies.referencedByTypes.${SalesforceMetadataTypes.PAGE_LAYOUT}` }},
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Description',     type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        ];
        if (isObjectInformationNeeded === true) {
            this.columns.splice(4, 0, // Bewteen package and Hardcoded URLs column
                { label: 'In this object',  type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
                { label: 'Object Type',     type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }},
            );
        }
    };

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number = 1;
    
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder = SortOrder.ASC;
}

export class WebLinksTableDefinitions extends AbstractWebLinksTableDefinitions {
    constructor() {
        super(false);
    }
}

export class WebLinksInObjectTableDefinitions extends AbstractWebLinksTableDefinitions {
    constructor() {
        super(true);
    }
}