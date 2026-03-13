import { API } from 'src/api/orgcheck-api-impl';
import { TableDefinitions } from 'src/ui/orgcheck-ui';
import { Exporter } from 'src/ui/exporter/orgcheck-ui-exporter';
import { RowsFactory } from 'src/ui/table/orgcheck-ui-table-rowsfactory';
import { SecretSauce } from './api/core/orgcheck-api-secretsauce';

class OrgCheck {
    public API: typeof API = API;
    public rules = {
        get: SecretSauce.GetScoreRule
    }
    public export = {
        asXlsx: Exporter.exportAsXls,
        asRaw: RowsFactory.export,
    }
    public ui = { 
        table: {
            createRows: RowsFactory.create,
            createAndExport: RowsFactory.createAndExport,
            filterRows: RowsFactory.filter,
            sortRows: RowsFactory.sort,
            definitions: TableDefinitions 
        },
    }
}

const orgcheck = new OrgCheck();
export default orgcheck;
