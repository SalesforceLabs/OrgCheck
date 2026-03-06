import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class FlowsTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                                                 type: ColumnType.IDX },
        { label: 'Score',                                             type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                                              type: ColumnType.URL, data: { value: 'url', label: 'name' }},
        { label: 'API Version',                                       type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Type',                                              type: ColumnType.TXT, data: { value: 'type' }},
        { label: 'Number of versions',                                type: ColumnType.NUM, data: { value: 'versionsCount' }},
        { label: 'Current Version (called `it` in the next columns)', type: ColumnType.URL, data: { value: 'currentVersionRef.url', label: 'currentVersionRef.name' }},
        { label: 'Is it Active?',                                     type: ColumnType.CHK, data: { value: 'isVersionActive' }},
        { label: 'Is it the Latest?',                                 type: ColumnType.CHK, data: { value: 'isLatestCurrentVersion' }},
        { label: 'Its SObject',                                       type: ColumnType.TXT, data: { value: 'currentVersionRef.sobject' }},
        { label: 'Its trigger type',                                  type: ColumnType.TXT, data: { value: 'currentVersionRef.triggerType' }},
        { label: 'Its record trigger type',                           type: ColumnType.TXT, data: { value: 'currentVersionRef.recordTriggerType' }},
        { label: 'Its Running Mode',                                  type: ColumnType.TXT, data: { value: 'currentVersionRef.runningMode' }, modifier: { valueIfEmpty: 'No mode specified.' }},
        { label: 'Its API Version',                                   type: ColumnType.NUM, data: { value: 'currentVersionRef.apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: '# Nodes',                                           type: ColumnType.NUM, data: { value: 'currentVersionRef.totalNodeCount' }},
        { label: '# DML Create Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlCreateNodeCount' }},
        { label: '# DML Delete Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlDeleteNodeCount' }},
        { label: '# DML Update Nodes',                                type: ColumnType.NUM, data: { value: 'currentVersionRef.dmlUpdateNodeCount' }},
        { label: '# Screen Nodes',                                    type: ColumnType.NUM, data: { value: 'currentVersionRef.screenNodeCount' }},
        { label: 'Its LFS Violations',                                type: ColumnType.TXTS, data: { values: 'currentVersionRef.lfsViolations', value: '.' }},
        { label: 'Its created date',                                  type: ColumnType.DTM, data: { value: 'currentVersionRef.createdDate' }},
        { label: 'Its modified date',                                 type: ColumnType.DTM, data: { value: 'currentVersionRef.lastModifiedDate' }},
        { label: 'Its description',                                   type: ColumnType.TXT, data: { value: 'currentVersionRef.description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        { label: 'Flow created date',                                 type: ColumnType.DTM, data: { value: 'createdDate' }},
        { label: 'Flow modified date',                                type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        { label: 'Flow description',                                  type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
        { label: 'Using',                                             type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
        { label: 'Referenced in',                                     type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',                                      type: ColumnType.DEP, data: { value: 'dependencies', id: 'currentVersionId', name: 'name' }}
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