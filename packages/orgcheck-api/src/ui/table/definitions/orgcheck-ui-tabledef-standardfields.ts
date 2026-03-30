import { ColumnType } from "src/ui/table/column/orgcheck-ui-table-columntype";
import { TableDefinition } from "src/ui/table/orgcheck-ui-table-definition";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/column/orgcheck-ui-table-column";

export class StandardFieldsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                   type: ColumnType.IDX },
        { label: 'Score',               type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }}, 
        { label: 'Field',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
        { label: 'Label',               type: ColumnType.TXT, data: { value: 'label' }},
        { label: 'Type',                type: ColumnType.TXT, data: { value: 'type' }},
        { label: 'Length',              type: ColumnType.TXT, data: { value: 'length' }},
        { label: 'Unique?',             type: ColumnType.CHK, data: { value: 'isUnique' }},
        { label: 'Encrypted?',          type: ColumnType.CHK, data: { value: 'isEncrypted' }},
        { label: 'External?',           type: ColumnType.CHK, data: { value: 'isExternalId' }},
        { label: 'Indexed?',            type: ColumnType.CHK, data: { value: 'isIndexed' }},
        { label: 'Restricted?',         type: ColumnType.CHK, data: { value: 'isRestrictedPicklist' }},
        { label: 'Tooltip',             type: ColumnType.TXT, data: { value: 'tooltip' }, modifier: { maximumLength: 45, valueIfEmpty: 'No tooltip.' }},
        { label: 'Formula',             type: ColumnType.TXT, data: { value: 'formula' }, modifier: { maximumLength: 100 , preformatted: true }},
        { label: 'Default Value',       type: ColumnType.TXT, data: { value: 'defaultValue' }},
        { label: 'Created date',        type: ColumnType.DTM, data: { value: 'createdDate' }},
        { label: 'Modified date',       type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        { label: 'Description',         type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
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