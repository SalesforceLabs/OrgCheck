import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

class AbstractApexTriggersTableDefinitions implements Table {
    
    /**
     * @description Constructor to specify if this table is in a context of an object. 
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default) (true by default)
     */
    constructor(isObjectInformationNeeded: boolean) {
        this.columns = [
            { label: '#',               type: ColumnType.IDX },
            { label: 'Score',           type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',            type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'API Version',     type: ColumnType.NUM, data: { value: 'apiVersion' }, modifier: { valueIfEmpty: 'No version.' }},
            { label: 'Package',         type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Size',            type: ColumnType.NUM, data: { value: 'length' }},
            { label: 'Hardcoded URLs',  type: ColumnType.TXTS, data: { values: 'hardCodedURLs', value: '.' }},
            { label: 'Hardcoded IDs',   type: ColumnType.TXTS, data: { values: 'hardCodedIDs', value: '.' }},
            { label: 'Active?',         type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Has SOQL?',       type: ColumnType.CHK, data: { value: 'hasSOQL' }},
            { label: 'Has DML?',        type: ColumnType.CHK, data: { value: 'hasDML' }},
            { label: '*Insert',         type: ColumnType.CHK, data: { value: 'beforeInsert' }},
            { label: 'Insert*',         type: ColumnType.CHK, data: { value: 'afterInsert' }},
            { label: '*Update',         type: ColumnType.CHK, data: { value: 'beforeUpdate' }},
            { label: 'Update*',         type: ColumnType.CHK, data: { value: 'afterUpdate' }},
            { label: '*Delete',         type: ColumnType.CHK, data: { value: 'beforeDelete' }},
            { label: 'Delete*',         type: ColumnType.CHK, data: { value: 'afterDelete' }},
            { label: 'Undelete',        type: ColumnType.CHK, data: { value: 'afterUndelete' }},
            { label: 'Using',           type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Dependencies',    type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',    type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',   type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ];
        if (isObjectInformationNeeded === true) {
            this.columns.splice(8, 0, // Bewteen Hardcoded IDs and Active column
                { label: 'Object API Name', type: ColumnType.TXT, data: { value: 'objectId' }}, 
                { label: 'Object Name',     type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}
            );
        }
    }

    /**
     * @description List of columns in a table
     * @type {Array<TableColumn>}
     */
    columns: Array<TableColumn>;

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

export class ApexTriggersTableDefinitions extends AbstractApexTriggersTableDefinitions {
    constructor() {
        super(true);
    }
}

export class ApexTriggersInObjectTableDefinitions extends AbstractApexTriggersTableDefinitions {
    constructor() {
        super(false);
    }
}