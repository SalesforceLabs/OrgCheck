import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class KnowledgeArticlesTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: '#',              type: ColumnType.IDX },
        { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'versionId', name: 'number' }},
        { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'number' }},
        { label: 'Title',          type: ColumnType.TXT, data: { value: 'title' }},
        { label: 'Status',         type: ColumnType.TXT, data: { value: 'status' }},
        { label: 'Url Name',       type: ColumnType.TXT, data: { value: 'urlName' }},
        { label: 'Hardcoded URL?', type: ColumnType.CHK, data: { value: 'isHardCodedURL' }},
        { label: 'Created date',   type: ColumnType.DTM, data: { value: 'createdDate' }},
        { label: 'Modified date',  type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
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