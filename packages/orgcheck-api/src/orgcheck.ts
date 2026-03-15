import { API } from 'src/api/orgcheck-api-impl';
import { TableDefinitions } from 'src/ui/orgcheck-ui';
import { Exporter } from 'src/ui/exporter/orgcheck-ui-exporter';
import { RowsFactory } from 'src/ui/table/orgcheck-ui-table-rowsfactory';
import { SecretSauce } from './api/core/orgcheck-api-secretsauce';
import { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';

export type { ApiIntf, ApiSetup } from 'src/api/orgcheck-api';
export type { SalesforceManagerSetup } from 'src/api/core/orgcheck-api-setup-salesforcemanager';
export type { SalesforceAuthenticationOptions } from 'src/api/core/orgcheck-api-setup-salesforcemanager';
export type { StorageSetup } from 'src/api/core/orgcheck-api-setup-storage';
export type { LoggerSetup } from 'src/api/core/orgcheck-api-setup-logger';
export type { DataCollectionStatisticsIntf } from 'src/api/core/orgcheck-api-data-datacollectionstats';

export class ApiFactory {
    public static create(setup: ApiSetup): ApiIntf {
        return new API(setup);
    }
}

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
