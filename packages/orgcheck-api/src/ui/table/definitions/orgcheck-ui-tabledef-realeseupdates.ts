import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class ReleaseUpdatesTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: '#',                      type: ColumnType.IDX },
        { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                   type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'Category',               type: ColumnType.TXT,  data: { value: 'category' }},
        { label: 'Due date',               type: ColumnType.DTM,  data: { value: 'dueDate' }},
        { label: 'Remaining days',         type: ColumnType.NUM,  data: { value: 'remainingDaysBeforeDueDate' }},
        { label: 'Released yet?',          type: ColumnType.CHK,  data: { value: 'isReleased' }},
        { label: 'Completed steps',        type: ColumnType.NUM,  data: { value: 'nbCompletedSteps' }},
        { label: 'Total steps',            type: ColumnType.NUM,  data: { value: 'nbAllSteps' }},
        { label: 'Completion',             type: ColumnType.PRC,  data: { value: 'completionPercentage' }},
        { label: 'Release',                type: ColumnType.TXT,  data: { value: 'sfdcReleaseLabel' }},
        { label: 'Status',                 type: ColumnType.TXT,  data: { value: 'status' }}
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