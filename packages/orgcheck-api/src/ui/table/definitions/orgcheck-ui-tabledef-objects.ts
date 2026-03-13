import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class ObjectsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                type: ColumnType.IDX },
        { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Label',            type: ColumnType.URL, data: { value: 'url', label: 'label' }},
        { label: 'Name',             type: ColumnType.TXT, data: { value: 'name' }},
        { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
        { label: 'Custom fields',    type: ColumnType.NUM, data: { value: 'nbCustomFields' }},
        { label: 'Page layouts',     type: ColumnType.NUM, data: { value: 'nbPageLayouts' }},
        { label: 'Record types',     type: ColumnType.NUM, data: { value: 'nbRecordTypes' }},
        { label: 'Workflows',        type: ColumnType.NUM, data: { value: 'nbWorkflowRules' }},
        { label: 'Apex Triggers',    type: ColumnType.NUM, data: { value: 'nbApexTriggers' }},
        { label: 'Validation Rules', type: ColumnType.NUM, data: { value: 'nbValidationRules' }},
        { label: 'Internal OWD',     type: ColumnType.TXT, data: { value: 'internalSharingModel' }},
        { label: 'External OWD',     type: ColumnType.TXT, data: { value: 'externalSharingModel' }}
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