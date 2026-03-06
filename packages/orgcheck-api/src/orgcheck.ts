import { API } from 'src/api/orgcheck-api-impl';
import { TableDefinitions } from 'src/ui/orgcheck-ui';
import { Exporter } from 'src/ui/exporter/orgcheck-ui-exporter';
import { RowsFactory } from 'src/ui/table/orgcheck-ui-table-rowsfactory';

class OrgCheck {
    public API: typeof API = API;
    public export = {
        asXlsx: Exporter.exportAsXls,
        asRaw: RowsFactory.export
    }
    public ui = { 
        table: {
            createRows: RowsFactory.create,
            filterRows: RowsFactory.filter,
            sortRows: RowsFactory.sort,
            definitions: TableDefinitions 
        },
    }
}

const orgcheck = new OrgCheck();
export default orgcheck;
