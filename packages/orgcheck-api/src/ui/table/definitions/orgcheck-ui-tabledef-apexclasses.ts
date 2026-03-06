import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

export class ApexClassesTableDefinitions implements Table {
    
    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn> = [
        { label: '#',                      type: ColumnType.IDX },
        { label: 'Score',                  type: ColumnType.SCR,  data: { value: 'score', id: 'id', name: 'name' }},
        { label: 'Name',                   type: ColumnType.URL,  data: { value: 'url', label: 'name' }},
        { label: 'API Version',            type: ColumnType.NUM,  data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
        { label: 'Package',                type: ColumnType.TXT,  data: { value: 'package' }},
        { label: 'Class',                  type: ColumnType.CHK,  data: { value: 'isClass' }},
        { label: 'Abst.',                  type: ColumnType.CHK,  data: { value: 'isAbstract' }},
        { label: 'Intf.',                  type: ColumnType.CHK,  data: { value: 'isInterface' }},
        { label: 'Enum',                   type: ColumnType.CHK,  data: { value: 'isEnum' }},
        { label: 'Schdl.',                 type: ColumnType.CHK,  data: { value: 'isSchedulable' }},
        { label: 'Access',                 type: ColumnType.TXT,  data: { value: 'specifiedAccess' }},
        { label: 'Implements',             type: ColumnType.TXTS, data: { values: 'interfaces', value: '.' }},
        { label: 'Extends',                type: ColumnType.TXT,  data: { value: 'extends' }},
        { label: 'Size',                   type: ColumnType.NUM,  data: { value: 'length' }},
        { label: 'Hardcoded URLs',         type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
        { label: 'Hardcoded IDs',          type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
        { label: 'Methods',                type: ColumnType.NUM,  data: { value: 'methodsCount' }},
        { label: 'Inner Classes',          type: ColumnType.NUM,  data: { value: 'innerClassesCount' }},
        { label: 'Annotations',            type: ColumnType.TXTS, data: { values: 'annotations', value: '.' }},
        { label: 'Sharing',                type: ColumnType.TXT,  data: { value: 'specifiedSharing' }, modifier: { valueIfEmpty: 'Not specified.' }},
        { label: 'Scheduled',              type: ColumnType.CHK,  data: { value: 'isScheduled' }},
        { label: 'Coverage (>75%)',        type: ColumnType.PRC,  data: { value: 'coverage' }, modifier: { valueIfEmpty: 'No coverage!' }},
        { label: 'Editable Related Tests', type: ColumnType.URLS, data: { values: 'relatedTestClassRefs', value: 'url', label: 'name' }},
        { label: 'Using',                  type: ColumnType.NUM,  data: { value: 'dependencies.using.length' }},
        { label: 'Referenced in',          type: ColumnType.NUM,  data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
        { label: 'Dependencies',           type: ColumnType.DEP,  data: { value: 'dependencies', id: 'id', name: 'name' }},
        { label: 'Created date',           type: ColumnType.DTM,  data: { value: 'createdDate' }},
        { label: 'Modified date',          type: ColumnType.DTM,  data: { value: 'lastModifiedDate' }}
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