import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class SharingRulesTableDefinition implements TableDefinition {

    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: '#',                      type: ColumnType.IDX },
//        { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Object',                 type: ColumnType.TXT,  data: { value: 'objectType' }},
        { label: 'Name',                   type: ColumnType.TXT,  data: { value: 'name' }},
        { label: 'Type',                   type: ColumnType.TXT,  data: { value: 'type' }},
        { label: 'Shared From Conditions', type: ColumnType.TXTS, data: { values: 'sharedFromConditions', value: '.' }},
        { label: 'Shared From Logic',      type: ColumnType.TXT,  data: { value: 'sharedFromLogic' }},
        { label: 'Access Level',           type: ColumnType.TXT,  data: { value: 'accessLevel' }},
        { label: 'Shared To Name',         type: ColumnType.TXT,  data: { value: 'sharedToName' }},
        { label: 'Shared To Type',         type: ColumnType.TXT,  data: { value: 'sharedToType' }},
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
