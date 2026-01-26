import { Exporter } from "../../../src/ui/exporter/orgcheck-ui-exporter";
import * as XLSX from 'xlsx';

describe('tests.ui.unit.Exporter', () => {

    describe('Test Exporter', () => {
        globalThis.XLSX = XLSX;

        it('checks if exporter throws an exception if empty source (exception from SheetJS)', () => {
            expect(() => Exporter.exportAsXls([])).toThrowError('Workbook is empty');
        });

        it('checks if exporter generates a file with only one worksheet', async () => {
            const buffer = Exporter.exportAsXls({
                header: 'Test Table',
                columns: [ 'Column 1', 'Column 2' ],
                rows: [
                    [ 'Cell 1-1', 'Cell 1-2' ],
                    [ 'Cell 2-1', 'Cell 2-2' ]
                ]
            });
            expect(buffer).toBeDefined();
            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);
            const workbook = XLSX.read(buffer, { type: 'binary' });
            expect(workbook).toBeDefined();
            expect(workbook.SheetNames.length).toBe(1);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            expect(data.length).toBe(3); // including header
            expect(data[0]).toEqual([ 'Column 1', 'Column 2' ]);
            expect(data[1]).toEqual([ 'Cell 1-1', 'Cell 1-2' ]);
            expect(data[2]).toEqual([ 'Cell 2-1', 'Cell 2-2' ]);    
        });

        it('checks if exporter generates a file with three worksheets', async () => {
            const buffer = Exporter.exportAsXls([
                {
                    header: 'Test Table',
                    columns: [ 'Column 1', 'Column 2' ],
                    rows: [
                        [ 'Cell 1-1', 'Cell 1-2' ],
                        [ 'Cell 2-1', 'Cell 2-2' ]
                    ]
                }, {
                    header: 'Test Table 2',
                    columns: [ 'Column A', 'Column B' ],
                    rows: [
                        [ 'Cell A-1', 'Cell B-1' ],
                        [ 'Cell A-2', 'Cell B-2' ]
                    ]
                }, {
                    header: 'Test Table 3',
                    columns: [ 'Column X', 'Column Y', 'Column Z' ],
                    rows: [
                        [ 'Cell X-1', 'Cell Y-1' ],
                        [ 'Cell X-2', 'Cell Y-2', 'Cell Z-2' ]  
                    ]
                }
            ]);
            expect(buffer).toBeDefined();
            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);
            const workbook = XLSX.read(buffer, { type: 'binary' });
            expect(workbook).toBeDefined();
            expect(workbook.SheetNames.length).toBe(3);
        });

        it('checks if exporter truncates long cell content', async () => {
            const longString = 'A'.repeat(40000);
            const buffer = Exporter.exportAsXls({
                header: 'Test Table',
                columns: [ 'Column 1', 'Column 2' ],
                rows: [
                    [ longString, 'Cell 1-2' ],
                    [ 'Cell 2-1', longString ]
                ]
            });
            const workbook = XLSX.read(buffer, { type: 'binary' });
            expect(workbook).toBeDefined();
            expect(workbook.SheetNames.length).toBe(1);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            expect(data.length).toBe(3); // including header
            data.forEach(row => row.forEach(cell => {
                expect(cell).toBeDefined();
                expect(typeof cell).toBe('string');
                expect(cell.length).toBeLessThanOrEqual(32767);
            }));
        });

        it('checks if exporter handles well string, empty values, boolean, and arrays', async () => {
            const buffer = Exporter.exportAsXls({
                header: 'Test Table',
                columns: [ 'Type', 'Value', 'ExpectedValue' ],
                rows: [
                    [ 'string', 'Cell 1-2', 'Cell 1-2' ],
                    [ 'emptyString', '', '' ],
                    [ 'number', 12345, '12345' ],
                    [ 'booleanTrue', true, 'true' ],
                    [ 'booleanFalse', false, 'false' ],
                    [ 'null', null, '' ],
                    [ 'undefined', undefined, ''],
                    [ 'arrayOfNumbers', [1, 2, 3], `[1, 2, 3]` ],
                    [ 'arrayOfStrings', ['4', '2', '3'], `[4, 2, 3]`],
                    [ 'arrayOfBooleans', [true, true, false], `[true, true, false]` ]
                ]
            });
            expect(buffer).toBeDefined();
            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);
            const workbook = XLSX.read(buffer, { type: 'binary' });
            expect(workbook).toBeDefined();
            expect(workbook.SheetNames.length).toBe(1);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            data.shift(); // remove the headers
            data.forEach((row) => {
                expect(row[1]).toBe(row[2]);
            });
        });

        it('checks if exporter throws exception in case of object in a cell', async () => {
            expect(() => Exporter.exportAsXls({
                header: 'Test Table',
                columns: [ 'Type', 'Value' ],
                rows: [
                    [ 'object', { key: 'value', name: 'test' } ]
                ]
            })).toThrowError();
        });
    });
});