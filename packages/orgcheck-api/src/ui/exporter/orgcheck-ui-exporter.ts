import { ExportedTable } from "../table/orgcheck-ui-table";

const TITLE_MAX_SIZE = 31;
const CELL_MAX_SIZE = 32767;
const TRUNCATE_MSG = '... (truncated)';

export class Exporter {

    /**
     * @param {Array<ExportedTable> | ExportedTable} source - Data to export
     * @returns {ArrayBuffer} Generated XLS data
     */
    static exportAsXls(source: Array<ExportedTable> | ExportedTable): ArrayBuffer {
        // @ts-ignore
        const xlsx = typeof window !== 'undefined' ? window?.XLSX : globalThis?.XLSX ?? null;
        if (!xlsx) {
            throw new Error('XLSX not available, skipping XLS export');
        }

        // Create a new workbook
        const workbook = xlsx.utils.book_new();
        (Array.isArray(source) ? source : [ source ]).forEach(/** @param {ExportedTable} item - information about a data exportable */ (item: ExportedTable) => {
            const datasheet = [ item.columns ].concat(
                item.rows.map((row, i) => 
                    row.map((cell, j) => {
                        // Important: At this point, all cells (in the source) SHOULD be strings -- ready to be exported.
                        // Not objects, not arrays, not booleans nor numbers.
                        // Not even null/undefined -- they must be empty strings. (reminder: typeof null is "object"!!)
                        // so in short, ONLY strings!!
                        // For any string transformation, please refer to RowsFactory.export() method
                        if (typeof cell != 'string') {
                            throw new Error(`Invalid cell type at row ${i+1}, column ${item.columns[j]} (${j+1}) of table "${item.header}": expected string but got ${typeof cell}`);
                        }
                        // Excel has a max cell size of 32,767 characters
                        if (cell.length > CELL_MAX_SIZE) return cell.substring(0, CELL_MAX_SIZE-TRUNCATE_MSG.length) + TRUNCATE_MSG;
                        return cell;
                    })
                )
            );
            const worksheet = xlsx.utils.aoa_to_sheet(datasheet);
            worksheet['!cols'] = item.columns.map((c, i) => { 
                const maxWidth = datasheet.reduce((prev, curr) => {
                    if (curr && typeof curr[i] === 'string') return Math.max(prev, curr[i]?.length);
                    return prev;
                }, 10);
                return maxWidth ? { wch: maxWidth } : {};
            });
            const sheetName = `${item.header} (${item.rows.length})`.substring(0, TITLE_MAX_SIZE); // Cannot exceed 31 characters!
            xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        // Generate XLS file as a Blob
        const workfile = xlsx.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const workfileAsBuffer = new ArrayBuffer(workfile.length)
        const workfileAsBufferView = new Uint8Array(workfileAsBuffer)
        for (let i = 0; i < workfile.length; i++) workfileAsBufferView[i] = workfile.charCodeAt(i) & 0xff
        return workfileAsBuffer;
    }
}