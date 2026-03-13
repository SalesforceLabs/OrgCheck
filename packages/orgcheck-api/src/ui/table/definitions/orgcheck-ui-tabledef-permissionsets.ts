import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class PermissionSetsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                      type: ColumnType.IDX },
        { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                   type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'Is Group?',              type: ColumnType.CHK,  data: { value: 'isGroup' }},
        { label: 'Custom',                 type: ColumnType.CHK,  data: { value: 'isCustom' }},
        { label: '#FLSs',                  type: ColumnType.NUM,  data: { value: 'nbFieldPermissions' }},
        { label: '#Object CRUDs',          type: ColumnType.NUM,  data: { value: 'nbObjectPermissions' }},
        { label: 'Is Admin-like?',         type: ColumnType.CHK,  data: { value: 'isAdminLike' }},
        { label: 'Api Enabled',            type: ColumnType.CHK,  data: { value: 'importantPermissions.apiEnabled' }},
        { label: 'View Setup',             type: ColumnType.CHK,  data: { value: 'importantPermissions.viewSetup' }},
        { label: 'Modify All Data',        type: ColumnType.CHK,  data: { value: 'importantPermissions.modifyAllData' }},
        { label: 'View All Data',          type: ColumnType.CHK,  data: { value: 'importantPermissions.viewAllData' }},
        { label: 'Manage Users',           type: ColumnType.CHK,  data: { value: 'importantPermissions.manageUsers' }},
        { label: 'Customize Application',  type: ColumnType.CHK,  data: { value: 'importantPermissions.customizeApplication' }},
        { label: 'License',                type: ColumnType.TXT,  data: { value: 'license' }},
        { label: 'Package',                type: ColumnType.TXT,  data: { value: 'package' }},
        { label: '#Active users',          type: ColumnType.NUM,  data: { value: 'memberCounts' }, modifier: { minimum: 1, valueBeforeMin: 'No active user', valueIfEmpty: '' }},
        { label: 'Contains',               type: ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }},
        { label: 'Included in',            type: ColumnType.URLS, data: { values: 'permissionSetGroupRefs', value: 'url', label: 'name' }},
        { label: 'All groups are empty?',  type: ColumnType.CHK,  data: { value: 'allIncludingGroupsAreEmpty' }},
        { label: 'Created date',           type: ColumnType.DTM,  data: { value: 'createdDate' }},
        { label: 'Modified date',          type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }},
        { label: 'Description',            type: ColumnType.TXT,  data: { value: 'description'}, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
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