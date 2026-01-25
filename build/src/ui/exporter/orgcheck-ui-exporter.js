import { ExportedTable } from "../table/orgcheck-ui-table";

const TITLE_MAX_SIZE = 31;
const CELL_MAX_SIZE = 32767;

export class Exporter {

    /**
     * @param {Array<ExportedTable> | ExportedTable} source - Data to export
     * @returns {Blob} Generated XLS file as a Blob
     */
    static exportAsXls(source) {
        // @ts-ignore
        const xlsx = window?.XLSX ?? null;
        if (!xlsx) {
            throw new Error('XLSX not available, skipping XLS export');
        }

        // Create a new workbook
        const workbook = xlsx.utils.book_new();
        (Array.isArray(source) ? source : [ source ]).forEach(/** @param {ExportedTable} item - information about a data exportable */ item => {
            const datasheet = [ item.columns ].concat(
                item.rows.map(row => 
                    row.map(cell => {
                        if (typeof cell === 'string' && cell.length > CELL_MAX_SIZE) return cell?.substring(0, CELL_MAX_SIZE);
                        return cell;
                    })
                )
            );
            const worksheet = xlsx.utils.aoa_to_sheet(datasheet);
            worksheet['!cols'] = item.columns.map((c, i) => { 
                const maxWidth = datasheet.reduce((prev, curr) => {
                    if (typeof curr[i] === 'string') return Math.max(prev, curr[i]?.length);
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
        return new Blob([workfileAsBuffer], { type: 'application/octet-stream' });
    }
}