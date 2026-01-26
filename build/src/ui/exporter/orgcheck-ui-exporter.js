import { ExportedTable } from "../table/orgcheck-ui-table";

const TITLE_MAX_SIZE = 31;
const CELL_MAX_SIZE = 32767;
const CELL_ALLOWED_PRIMARY_TYPES = [ 'string', 'number', 'boolean' ];
const TRUNCATE_MSG = '... (truncated)';

const MAP_CELL_TO_STRING = (/** @type {any} */ cell) => {
    if (cell === null || cell === undefined) return '';
    if (CELL_ALLOWED_PRIMARY_TYPES.includes(typeof cell) === false) {
        throw new Error(`Cell type is not supported for XLS export (type: ${typeof cell}, supported primary types: ${CELL_ALLOWED_PRIMARY_TYPES.join(',')}), value: ${cell}`);
    }
    return `${cell}`;
}

const TRUNCATE_CELL_CONTENT = (/** @type {string} */ str) => {
    return str.length > CELL_MAX_SIZE ? (str?.substring(0, CELL_MAX_SIZE-TRUNCATE_MSG.length) + TRUNCATE_MSG) : str;
}

export class Exporter {

    /**
     * @param {Array<ExportedTable> | ExportedTable} source - Data to export
     * @returns {ArrayBuffer} Generated XLS data
     */
    static exportAsXls(source) {
        // @ts-ignore
        const xlsx = globalThis?.XLSX ?? null;
        if (!xlsx) {
            throw new Error('XLSX not available, skipping XLS export');
        }

        // Create a new workbook
        const workbook = xlsx.utils.book_new();
        (Array.isArray(source) ? source : [ source ]).forEach(/** @param {ExportedTable} item - information about a data exportable */ item => {
            const datasheet = [ item.columns ].concat(
                item.rows.map(row => 
                    row.map(cell => 
                        TRUNCATE_CELL_CONTENT(Array.isArray(cell) ? `[${cell.map(MAP_CELL_TO_STRING).join(', ')}]` : MAP_CELL_TO_STRING(cell))
                    )
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