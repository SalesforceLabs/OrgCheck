import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

class AbstractRecordTypesTableDefinitions implements Table {
    
    /**
     * @description Constructor to specify if this table is in a context of an object. 
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean) {
        this.columns = [
            { label: '#',              type: ColumnType.IDX },
            { label: 'Score',          type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',           type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Developer Name', type: ColumnType.TXT, data: { value: 'developerName' }},
            { label: 'Package',        type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Is Active',      type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Is Available',   type: ColumnType.CHK, data: { value: 'isAvailable' }},
            { label: 'Is Default',     type: ColumnType.CHK, data: { value: 'isDefault' }},
            { label: 'Is Master',      type: ColumnType.CHK, data: { value: 'isMaster' }}
        ];
        if (isObjectInformationNeeded === true) {
            this.columns.splice(4, 0, // Bewteen package and is active column
                { label: 'In this object', type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }}, 
                { label: 'Object Type',    type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }}
            );
        }
    };

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

export class RecordTypesTableDefinitions extends AbstractRecordTypesTableDefinitions {
    constructor() {
        super(true);
    }
}

export class RecordTypesInObjectTableDefinitions extends AbstractRecordTypesTableDefinitions {
    constructor() {
        super(false);
    }
}