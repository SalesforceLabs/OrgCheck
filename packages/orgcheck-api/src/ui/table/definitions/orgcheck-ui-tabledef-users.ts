import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class UsersTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: '#',                      type: ColumnType.IDX },
        { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'User Name',              type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'Under LEX?',             type: ColumnType.CHK,  data: { value: 'onLightningExperience' }},
        { label: 'Last login',             type: ColumnType.DTM,  data: { value: 'lastLogin' }, modifier: { valueIfEmpty: 'Never logged!' }},
        { label: 'Failed logins',          type: ColumnType.NUM,  data: { value: 'numberFailedLogins' }},
        { label: 'Has MFA by-pass?',       type: ColumnType.CHK,  data: { value: 'hasMfaByPass' }},
        { label: 'Has Debug mode?',        type: ColumnType.CHK,  data: { value: 'hasDebugMode' }},
        { label: '#SF Logins w/o MFA',     type: ColumnType.NUM,  data: { value: 'nbDirectLoginsWithoutMFA' }},
        { label: '#SF Logins w/ MFA',      type: ColumnType.NUM,  data: { value: 'nbDirectLoginsWithMFA' }},
        { label: '#SSO Logins',            type: ColumnType.NUM,  data: { value: 'nbSSOLogins' }},
        { label: 'Password change',        type: ColumnType.DTM,  data: { value: 'lastPasswordChange' }},
        { label: 'Is Admin-like?',         type: ColumnType.CHK,  data: { value: 'isAdminLike' }},
        { label: 'Api Enabled',            type: ColumnType.CHK,  data: { value: 'importantPermissions.apiEnabled' }},
        { label: 'Api Enabled from',       type: ColumnType.URLS, data: { values: 'importantPermissionsGrantedBy.apiEnabled', value: 'url', label: 'name' }},
        { label: 'View Setup',             type: ColumnType.CHK,  data: { value: 'importantPermissions.viewSetup' }},
        { label: 'View Setup from',        type: ColumnType.URLS, data: { values: 'importantPermissionsGrantedBy.viewSetup', value: 'url', label: 'name' }},
        { label: 'Modify All Data',        type: ColumnType.CHK,  data: { value: 'importantPermissions.modifyAllData' }},
        { label: 'Modify All Data from',   type: ColumnType.URLS, data: { values: 'importantPermissionsGrantedBy.modifyAllData', value: 'url', label: 'name' }},
        { label: 'View All Data',          type: ColumnType.CHK,  data: { value: 'importantPermissions.viewAllData' }},
        { label: 'View All Data from',     type: ColumnType.URLS, data: { values: 'importantPermissionsGrantedBy.viewAllData', value: 'url', label: 'name' }},
        { label: 'Manage Users',           type: ColumnType.CHK,  data: { value: 'importantPermissions.manageUsers' }},
        { label: 'Manage Users from',      type: ColumnType.URLS, data: { values: 'importantPermissionsGrantedBy.manageUsers', value: 'url', label: 'name' }},
        { label: 'Customize App.',         type: ColumnType.CHK,  data: { value: 'importantPermissions.customizeApplication' }},
        { label: 'Customize App. from',    type: ColumnType.URLS, data: { values: 'importantPermissionsGrantedBy.customizeApplication', value: 'url', label: 'name' }},
        { label: 'Profile',                type: ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
        { label: 'Permission Sets',        type: ColumnType.URLS, data: { values: 'permissionSetRefs', value: 'url', label: 'name' }}
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