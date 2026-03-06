import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class ProfilePasswordPoliciesTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
            { label: '#',                                         type: ColumnType.IDX },
            { label: 'Score',                                     type: ColumnType.SCR, data: { value: 'score', id: 'profileName', name: 'profileName' }},
            { label: 'Name',                                      type: ColumnType.TXT, data: { value: 'profileName' }},
            { label: 'User password expires in',                  type: ColumnType.NUM, data: { value: 'passwordExpiration' }},
            { label: 'Enforce password history',                  type: ColumnType.NUM, data: { value: 'passwordHistory' }},
            { label: 'Minimum password length',                   type: ColumnType.NUM, data: { value: 'minimumPasswordLength' }},
            { label: 'Level of complexity (/5)',                  type: ColumnType.NUM, data: { value: 'passwordComplexity' }},
            { label: 'Question can contain password',             type: ColumnType.CHK, data: { value: 'passwordQuestion' }},
            { label: 'Maximum Login Attempts',                    type: ColumnType.NUM, data: { value: 'maxLoginAttempts' }},
            { label: 'Lockout period',                            type: ColumnType.NUM, data: { value: 'lockoutInterval' }},
            { label: 'Require minimum one day password lifetime', type: ColumnType.CHK, data: { value: 'minimumPasswordLifetime' }},
            { label: 'Security Question Hidden',                  type: ColumnType.CHK, data: { value: 'obscure' }},
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
    orderSort: SortOrder = SortOrder.ASC;
}