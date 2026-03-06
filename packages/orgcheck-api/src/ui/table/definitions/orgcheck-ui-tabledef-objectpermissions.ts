import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";
import { DataMatrixIntf } from "src/api/core/orgcheck-api-data-matrix";
import { Orientation } from "../orgcheck-ui-table-columnorientation";

export class AppPermissionsTableDefinitions implements Table {
    
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
     * @type {Array<TableColumn>}
     */
    get columns(): Array<TableColumn> { 
        const columns: Array<TableColumn> = [
            { label: 'Parent',  type: ColumnType.URL, data: { value: 'header.url', label: 'header.name' }},
            { label: 'Package', type: ColumnType.TXT, data: { value: 'header.package' }},
            { label: 'Type',    type: ColumnType.TXT, data: { value: 'header.type' }},
            { label: 'Custom',  type: ColumnType.CHK, data: { value: 'header.isCustom' }}
        ];
        if (this._matrix) {
            this._matrix.columnHeaders // returns an array of Object like {id: string, label: string} representing an Application
                .sort((/** @type {{id: string, label: string}} */ a, /** @type {{id: string, label: string}} */b) => { 
                    return a.label < b.label ? -1: 1; 
                })
                .forEach((/** @type {{id: string, label: string}} */ app) => {
                    columns.push({ 
                        label: app.label, 
                        type: ColumnType.TXT, 
                        data: { 
                            value: `data.${app.id}` 
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
    orderSort: SortOrder = SortOrder.ASC;
}