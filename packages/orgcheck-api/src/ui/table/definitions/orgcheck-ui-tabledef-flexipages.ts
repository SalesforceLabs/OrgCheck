import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";

class AbstractFlexiPagesTableDefinitions implements Table {
    
    /**
     * @description Constructor to specify if this table is in a context of an object. 
     * @param {boolean} isObjectInformationNeeded - Is the object information needed in the table (true by default)
     */
    constructor(isObjectInformationNeeded: boolean) {
        this.columns = [
            { label: '#',                  type: ColumnType.IDX },
            { label: 'Score',              type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'name' }},
            { label: 'Name',               type: ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',               type: ColumnType.TXT, data: { value: 'type' }},
            { label: 'Package',            type: ColumnType.TXT, data: { value: 'package' }},
            { label: '#Components',        type: ColumnType.NUM, data: { value: 'nbComponents' }},
            { label: '#Fields',            type: ColumnType.NUM, data: { value: 'nbFields' }},
            { label: '#Related Lists',     type: ColumnType.NUM, data: { value: 'nbRelatedLists' }},
            { label: 'Attachment List?',   type: ColumnType.CHK, data: { value: 'isAttachmentRelatedListIncluded' }},
            { label: 'Lists from Layout?', type: ColumnType.CHK, data: { value: 'isRelatedListFromPageLayoutIncluded' }},
            { label: 'Using',              type: ColumnType.NUM, data: { value: 'dependencies.using.length' }},
            { label: 'Referenced in',      type: ColumnType.NUM, data: { value: 'dependencies.referenced.length' }, modifier: { minimum: 1, valueBeforeMin: 'Not referenced anywhere.', valueIfEmpty: 'N/A' }},
            { label: 'Dependencies',       type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }},
            { label: 'Created date',       type: ColumnType.DTM, data: { value: 'createdDate' }},
            { label: 'Modified date',      type: ColumnType.DTM, data: { value: 'lastModifiedDate' }},
            { label: 'Description',        type: ColumnType.TXT, data: { value: 'description' }, modifier: { maximumLength: 45, valueIfEmpty: 'No description.' }}
        ];
        if (isObjectInformationNeeded === true) {
            this.columns.splice(5, 0, // Between package and #Components columns
                { label: 'Object',         type: ColumnType.URL, data: { value: 'objectRef.url', label: 'objectRef.name' }, modifier: { valueIfEmpty: 'Not related to an object.' }},
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

export class FlexiPagesTableDefinitions extends AbstractFlexiPagesTableDefinitions {
    constructor() {
        super(false);
    }
}

export class FlexiPagesInObjectTableDefinitions extends AbstractFlexiPagesTableDefinitions {
    constructor() {
        super(true);
    }
}