import { ColumnType } from "src/ui/table/column/orgcheck-ui-table-columntype";
import { TableDefinition } from "src/ui/table/orgcheck-ui-table-definition";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/column/orgcheck-ui-table-column";

export class RelationshipsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                    type: ColumnType.IDX },
        { label: 'Name',                 type: ColumnType.TXT, data: { value: 'name' }},
        { label: 'Field Name',           type: ColumnType.TXT, data: { value: 'fieldName' }},
        { label: 'Child Object',         type: ColumnType.TXT, data: { value: 'childObject' }},
        { label: 'Is Cascade Delete',    type: ColumnType.CHK, data: { value: 'isCascadeDelete' }},
        { label: 'Is Restricted Delete', type: ColumnType.CHK, data: { value: 'isRestrictedDelete' }}
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