import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';

export class ApexTestsTableDefinition implements TableDefinition {
    
    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    columns: TableColumn[] = [
        { label: '#',                           type: ColumnType.IDX },
        { label: 'Score',                       type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                        type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'API Version',                 type: ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',                     type: ColumnType.TXT,  data: { value: 'package' }},
        { label: 'Size',                        type: ColumnType.NUM,  data: { value: 'length' }},
        { label: 'Hardcoded URLs',              type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
        { label: 'Hardcoded IDs',               type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
        { label: 'See All Data',                type: ColumnType.CHK,  data: { value: 'isTestSeeAllData' }},
        { label: 'Nb Asserts',                  type: ColumnType.NUM,  data: { value: 'nbSystemAsserts' }, modifier: { valueIfEmpty: 'No direct usage of Assert.Xxx() or System.assertXxx().' }},
        { label: 'Methods',                     type: ColumnType.NUM,  data: { value: 'methodsCount' }},
        { label: 'Latest Run Date',             type: ColumnType.DTM,  data: { value: 'lastTestRunDate' }},
        { label: 'Runtime',                     type: ColumnType.NUM,  data: { value: 'testMethodsRunTime' }},
        { label: 'Passed (but long) methods',   type: ColumnType.OBJS, data: { values: 'testPassedButLongMethods', value: '.', template: (r) => 
            `${r.methodName} (Runtime: ${(r.runtime as number)*1} ms`+
            // see https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_apextestresultlimits.htm
            ((r.cpuConsumption as number) > 0 ? `, CPU: ${(r.cpuConsumption as number)*1} ms`: '') +  // The amount of CPU used during the test run, in milliseconds.
            ((r.asyncCallsConsumption as number) > 0 ? `, Async Calls: ${r.asyncCallsConsumption}`: '') + // The number of asynchronous calls made during the test run.
            ((r.soslConsumption as number) > 0 ? `, SOSL: ${r.soslConsumption}`: '') + // The number of SOSL queries made during the test run.
            ((r.soqlConsumption as number) > 0 ? `, SOQL: ${r.soqlConsumption}`: '') + // The number of SOQL queries made during the test run.
            ((r.queryRowsConsumption as number) > 0 ? `, Query Rows: ${r.queryRowsConsumption}`: '') + // The number of rows queried during the test run.
            ((r.dmlRowsConsumption as number) > 0 ? `, Dml Rows: ${r.dmlRowsConsumption}`: '') + // The number of rows accessed by DML statements during the test run.
            ((r.dmlConsumption as number) > 0 ? `, Dml: ${r.dmlConsumption}`:'') + // The number of DML statements made during the test run.
        ')' }},
        { label: 'Failed methods',              type: ColumnType.OBJS, data: { values: 'testFailedMethods', value: '.', template: (r) => `${r.methodName} (${r.stacktrace})` }},
        { label: 'Inner Classes',               type: ColumnType.NUM,  data: { value: 'innerClassesCount' }},
        { label: 'Sharing',                     type: ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
        { label: 'Covering (editable classes)', type: ColumnType.URLS, data: { values: 'relatedClassRefs', value: 'url', label: 'name' }},
        { label: 'Using',                       type: ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
        { label: 'Dependencies',                type: ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',                type: ColumnType.DTM,  data: { value: 'createdDate' }},
        { label: 'Modified date',               type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
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