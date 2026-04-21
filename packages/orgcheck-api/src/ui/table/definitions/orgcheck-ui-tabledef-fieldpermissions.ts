import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';
import { TableDefinition } from 'src/ui/table/orgcheck-ui-table-definition';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { TableColumn } from 'src/ui/table/column/orgcheck-ui-table-column';
import { DataMatrixIntf } from 'src/api/core/data/orgcheck-api-data-matrix';
import { Orientation } from '../column/orgcheck-ui-table-orientation';

export class FieldPermissionsTableDefinition implements TableDefinition {
    
    private _matrix: DataMatrixIntf;

    /**
     * @description Constructor to specify a datamatrix to use
     * @param {DataMatrixIntf} matrix - DataMatrix to use to generate this table
     */
    constructor(matrix: DataMatrixIntf) {
        this._matrix = matrix;
    }

    /**
     * @description List of columns in a table
     * @type {TableColumn[]}
     */
    get columns(): TableColumn[] { 
        const columns: TableColumn[] = [
            { label: 'Parent',  type: ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
            { label: 'Package', type: ColumnType.TXT, data: { value: 'header.package' }},
            { label: 'Type',    type: ColumnType.TXT, data: { value: 'header.type' }},
            { label: 'Custom',  type: ColumnType.CHK, data: { value: 'header.isCustom' }}
        ];
        if (this._matrix) {
            this._matrix.columnHeaders // returns an array of string representing Field Api names
                .sort()
                .forEach((fieldApiName) => {
                    columns.push({ 
                        label: fieldApiName, 
                        type: ColumnType.TXT, 
                        data: { 
                            value: `data.${fieldApiName}` 
                        }, 
                        orientation: Orientation.VERTICAL 
                    });
                });
        }
        return columns;
    };

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