import { describe, it, expect } from '@jest/globals';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { SortOrder } from 'src/ui/table/orgcheck-ui-table-sortorder';
import { ColumnType } from 'src/ui/table/column/orgcheck-ui-table-columntype';

/**
 * Builds a minimal table with a single column of the given type.
 * Each value becomes the `value` of the cell in that column.
 */
const buildTable = (type: ColumnType, values: unknown[]): any => {
    return {
        name: 'test',
        definition: {
            columns: [{ label: 'Col', type, data: { value: 'v' } }]
        },
        rows: values.map((value, i) => ({
            index: i + 1,
            isVisible: true,
            cells: [{ data: { value } }]
        }))
    };
};

const sortedValues = (table: any): unknown[] => table.rows.map((row: any) => row.cells[0].data.value);

describe('tests.ui.unit.TableFactory', () => {

    describe('sort on a numeric column', () => {

        it('places empty values last in ASC order', () => {
            const table = buildTable(ColumnType.NUM, [3, undefined, 0, 10, null]);
            TableFactory.sort(table, 0, SortOrder.ASC);
            const values = sortedValues(table);
            expect(values.slice(0, 3)).toEqual([0, 3, 10]);
            expect(values.slice(3).every((v) => v === undefined || v === null)).toBe(true);
        });

        it('places empty values last in DESC order', () => {
            const table = buildTable(ColumnType.NUM, [3, undefined, 0, 10, null]);
            TableFactory.sort(table, 0, SortOrder.DESC);
            const values = sortedValues(table);
            expect(values.slice(0, 3)).toEqual([10, 3, 0]);
            expect(values.slice(3).every((v) => v === undefined || v === null)).toBe(true);
        });

        it('keeps 0 as a real value (not treated as empty)', () => {
            const table = buildTable(ColumnType.NUM, [undefined, 0, 1]);
            TableFactory.sort(table, 0, SortOrder.DESC);
            expect(sortedValues(table)).toEqual([1, 0, undefined]);
        });

        it('assigns visible row indexes in the sorted order', () => {
            const table = buildTable(ColumnType.NUM, [3, undefined, 0, 10]);
            TableFactory.sort(table, 0, SortOrder.DESC);
            expect(table.rows.map((row: any) => row.index)).toEqual([1, 2, 3, 4]);
        });
    });

    describe('sort on a text column', () => {

        it('places empty values last in ASC order', () => {
            const table = buildTable(ColumnType.TXT, ['bravo', '', 'alpha', undefined]);
            TableFactory.sort(table, 0, SortOrder.ASC);
            const values = sortedValues(table);
            expect(values.slice(0, 2)).toEqual(['alpha', 'bravo']);
            expect(values.slice(2).every((v) => v === '' || v === undefined)).toBe(true);
        });

        it('places empty values last in DESC order', () => {
            const table = buildTable(ColumnType.TXT, ['bravo', '', 'alpha', undefined]);
            TableFactory.sort(table, 0, SortOrder.DESC);
            const values = sortedValues(table);
            expect(values.slice(0, 2)).toEqual(['bravo', 'alpha']);
            expect(values.slice(2).every((v) => v === '' || v === undefined)).toBe(true);
        });
    });

    describe('sort on a boolean column (see ColumnType.CHK)', () => {

        it('sorts false before true in ASC order, with empty values last', () => {
            const table = buildTable(ColumnType.CHK, [true, undefined, false, true, false]);
            TableFactory.sort(table, 0, SortOrder.ASC);
            expect(sortedValues(table)).toEqual([false, false, true, true, undefined]);
        });

        it('sorts true before false in DESC order, with empty values last', () => {
            const table = buildTable(ColumnType.CHK, [true, undefined, false, true, false]);
            TableFactory.sort(table, 0, SortOrder.DESC);
            expect(sortedValues(table)).toEqual([true, true, false, false, undefined]);
        });
    });

    describe('sort on a dependencies column (see ColumnType.DEP)', () => {

        const item = (id: string) => ({ id, name: id, type: 'Test', url: '' });
        const dependencies = (nbUsing: number, nbReferenced: number, hadError = false) => ({
            hadError,
            using: Array.from({ length: nbUsing }, (_, i) => item(`u${i}`)),
            referenced: Array.from({ length: nbReferenced }, (_, i) => item(`r${i}`)),
            referencedByTypes: {}
        });
        // Total dependency count of each sorted row, or null if the row has no dependency (or an error)
        const counts = (table: any): (number | null)[] => sortedValues(table).map((v: any) => {
            const count = (v?.using?.length ?? 0) + (v?.referenced?.length ?? 0);
            return count > 0 ? count : null;
        });
        const values = () => [
            dependencies(2, 1),        // 3
            dependencies(0, 0),        // none
            dependencies(1, 0),        // 1
            dependencies(0, 0, true),  // error
            undefined,                 // no value at all
            dependencies(4, 2)         // 6
        ];

        it('sorts by total number of dependencies in ASC order, with none/error rows last', () => {
            const table = buildTable(ColumnType.DEP, values());
            TableFactory.sort(table, 0, SortOrder.ASC);
            expect(counts(table)).toEqual([1, 3, 6, null, null, null]);
        });

        it('sorts by total number of dependencies in DESC order, with none/error rows last', () => {
            const table = buildTable(ColumnType.DEP, values());
            TableFactory.sort(table, 0, SortOrder.DESC);
            expect(counts(table)).toEqual([6, 3, 1, null, null, null]);
        });
    });
});
