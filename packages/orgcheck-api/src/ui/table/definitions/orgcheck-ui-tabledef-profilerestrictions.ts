import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class ProfileRestrictionsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',               type: ColumnType.IDX },
        { label: 'Score',           type: ColumnType.SCR,  data: { value: 'score', id: 'profileRef.id', name: 'profileRef.name' }},
        { label: 'Name',            type: ColumnType.URL,  data: { value: 'profileRef.url', label: 'profileRef.name' }},
        { label: 'Custom',          type: ColumnType.CHK,  data: { value: 'profileRef.isCustom' }},
        { label: 'Package',         type: ColumnType.TXT,  data: { value: 'profileRef.package' }},
        { label: 'Ip Ranges',       type: ColumnType.OBJS, data: { values: 'ipRanges', value: '.', template: (r) => `${r.description}: from ${r.startAddress} to ${r.endAddress} --> ${r.difference*1} address(es)` }},
        { label: 'Login Hours',     type: ColumnType.OBJS, data: { values: 'loginHours', value: '.', template: (r) => `${r.day} from ${r.fromTime} to ${r.toTime} --> ${r.difference*1} minute(s)` }},
        { label: 'Description',     type: ColumnType.TXT,  data: { value: 'profileRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
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