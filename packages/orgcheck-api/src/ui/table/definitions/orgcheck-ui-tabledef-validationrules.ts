import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

class AbstractValidationRulesTableDefinitions implements Table {
    
    /**
     * @description Constructor to specify if this table is in a context of an object. 
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean) {
        this.columns = [
            { label: '#',                type: ColumnType.IDX },
            { label: 'Score',            type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',             type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Package',          type: ColumnType.TXT, data: { value: 'package' }},
            { label: 'Is Active',        type: ColumnType.CHK, data: { value: 'isActive' }},
            { label: 'Display On Field', type: ColumnType.TXT, data: { value: 'errorDisplayField' }},
            { label: 'Error Message',    type: ColumnType.TXT, data: { value: 'errorMessage' }},
            { label: 'Description',      type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }},
            { label: 'Created date',     type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',    type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
        ];
        if (isObjectInformationNeeded === true) {
            this.columns.splice(4, 0, // Bewteen package and is active column
                { label: 'Object API Name',  type: ColumnType.TXT, data: { value: 'objectId' }}, 
                { label: 'Object Name',      type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'N/A' }}, 
                { label: 'Object Type',      type: ColumnType.TXT, data: { value: 'objectRef.typeRef.label' }, modifier: { valueIfEmpty: 'N/A' }}
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
    orderSort: SortOrder = SortOrder.ASC;
}

export class ValidationRulesTableDefinitions extends AbstractValidationRulesTableDefinitions {
    constructor() {
        super(false);
    }
}

export class ValidationRulesInObjectTableDefinitions extends AbstractValidationRulesTableDefinitions {
    constructor() {
        super(true);
    }
}