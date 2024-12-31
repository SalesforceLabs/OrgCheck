import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';

export class OrgCheckDatasetCurrentUserPermissions extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, boolean>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const permissionFields = parameters?.get('permissions');

        // First SOQL query
        logger?.log(`Querying REST API about UserPermissionAccess in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: `SELECT ${permissionFields.map(p => `Permissions${p}`).join(`, `)} ` +
                    'FROM UserPermissionAccess '+
                    'LIMIT 1',
            tooling: false,
            byPasses: [],
            queryMoreField: ''
        }], logger);
        const permissions = results[0].records[0];
        logger?.log(`Parsing the results...`);            

        // Return data as map
        return new Map(await OrgCheckProcessor.map(
            Object.keys(permissions),
            (field) => [ field, permissions[field] ],
            (field) => field.startsWith('Permissions')
        ));
    } 
}