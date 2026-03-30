import { ColumnType } from "src/ui/table/column/orgcheck-ui-table-columntype";
import { TableDefinition } from "src/ui/table/orgcheck-ui-table-definition";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/column/orgcheck-ui-table-column";

export class PageLayoutsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                type: ColumnType.IDX },
        { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',             type: ColumnType.URL, data: { value: 'url', label: 'name' }},
        { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
        { label: 'Type',             type: ColumnType.TXT, data: { value: 'type' }},
        { label: 'Object',           type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }},
        { label: 'Assignment Count', type: ColumnType.NUM, data: { value: 'profileAssignmentCount' }},
        { label: '#Fields',          type: ColumnType.NUM, data: { value: 'nbFields' }},
        { label: '#Related Lists',   type: ColumnType.NUM, data: { value: 'nbRelatedLists' }},
        { label: 'Attachment List?', type: ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
        { label: 'Created date',     type: ColumnType.DTM, data: { value: 'createdDate' }},
        { label: 'Modified date',    type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        { label: 'Using',            type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
        { label: 'Referenced in',    type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }}, 
        { label: 'Dependencies',     type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }}
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