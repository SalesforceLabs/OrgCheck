import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class PublicGroupsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: '#',                       type: ColumnType.IDX },
        { label: 'Score',                   type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                    type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'Developer Name',          type: ColumnType.TXT,  data: { value: 'developerName' }},
        { label: 'With bosses?',            type: ColumnType.CHK,  data: { value: 'includeBosses' }},
        { label: '#Explicit members',       type: ColumnType.NUM,  data: { value: 'nbDirectMembers' }},
        { label: 'Explicit groups (links)', type: ColumnType.URLS, data: { values: 'directGroupRefs', value: 'url', label: 'name' }},
        { label: 'Explicit groups (info)',  type: ColumnType.OBJS, data: { values: 'directGroupRefs', value: '.', template: (g) => `${g.name} (${g.type}${g.includeBosses?' with bosses':''}${g.includeSubordinates?' with subordinates':''})` }},
        { label: 'Explicit users',          type: ColumnType.URLS, data: { values: 'directUserRefs', value: 'url', label: 'name' }}
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