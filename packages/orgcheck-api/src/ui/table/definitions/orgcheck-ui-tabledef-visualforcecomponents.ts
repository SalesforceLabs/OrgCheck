import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class VisualForceComponentsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',              type: ColumnType.IDX },
        { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
        { label: 'API Version',    type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
        { label: 'Hardcoded URLs', type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
        { label: 'Hardcoded IDs',  type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
        { label: 'Using',          type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
        { label: 'Referenced in',  type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',   type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
        { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        { label: 'Description',    type: ColumnType.TXT, data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
    ];

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number = 1;
    
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder = SortOrder.DESC;
}