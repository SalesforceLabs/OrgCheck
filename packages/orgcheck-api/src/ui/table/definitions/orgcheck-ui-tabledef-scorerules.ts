import { ColumnType } from "src/ui/table/orgcheck-ui-table-columntype";
import { Table } from "src/ui/table/orgcheck-ui-table";
import { SortOrder } from "src/ui/table/orgcheck-ui-table-sortorder";
import { TableColumn } from "src/ui/table/orgcheck-ui-table-column";
import { DataMatrixIntf } from "src/api/core/orgcheck-api-data-matrix";
import { Orientation } from "../orgcheck-ui-table-columnorientation";

export class ScoreRulesTableDefinitions implements Table {
    
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
            { label: 'Rules (or reason why metadata is bad)', type: ColumnType.TXT, data: { value: 'header.description' }}
        ];
        if (this._matrix) {
            this._matrix.columnHeaders // returns an array of string representing the static 'label' of the org check class
                .sort()
                .forEach((classLabel: string) => {
                    columns.push({ 
                        label: classLabel, 
                        type: ColumnType.CHK, 
                        data: { 
                            value: `data.${classLabel}` 
                        }, orientation: Orientation.VERTICAL 
                    });
                });
        }
        return columns;
    };

    /**
     * @description Which index column is used for ordering?
     * @type {number}
     */
    orderIndex: number = 0;
    
    /**
     * @description What is the sort order: ASC or DESC?
     * @type {SortOrder}
     */
    orderSort: SortOrder = SortOrder.ASC;
}