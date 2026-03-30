import { ColumnType } from "src/ui/table/column/orgcheck-ui-table-columntype";
import { TableDefinition } from "src/ui/table/orgcheck-ui-table-definition";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/column/orgcheck-ui-table-column";

export class PermissionSetLicensesTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                     type: ColumnType.IDX },
        { label: 'Score',                 type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                  type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'Total',                 type: ColumnType.NUM,  data: { value: 'totalCount' }},
        { label: 'Used',                  type: ColumnType.NUM,  data: { value: 'usedCount' }},
        { label: 'Used (%)',              type: ColumnType.PRC,  data: { value: 'usedPercentage' }},
        { label: 'Remaining',             type: ColumnType.NUM,  data: { value: 'remainingCount' }},
        { label: 'Users Really Assigned', type: ColumnType.NUM,  data: { value: 'distinctActiveAssigneeCount' }},
        { label: 'Permission Sets',       type: ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
        { label: 'Status',                type: ColumnType.TXT,  data: { value: 'status' }},
        { label: 'Expiration Date',       type: ColumnType.DTM,  data: { value: 'expirationDate' }},
        { label: 'For Integration?',      type: ColumnType.CHK,  data: { value: 'isAvailableForIntegrations' }},
        { label: 'Created date',          type: ColumnType.DTM,  data: { value: 'createdDate' }},
        { label: 'Modified date',         type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
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