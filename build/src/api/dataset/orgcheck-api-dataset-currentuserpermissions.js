import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';

export class DatasetCurrentUserPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, boolean>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const permissionFields = parameters?.get(OrgCheckGlobalParameter.SYSTEM_PERMISSIONS_LIST);

        // Checking parameters
        if (permissionFields === undefined || permissionFields.length === 0) {
            throw new Error(`DatasetCurrentUserPermissions: No '${OrgCheckGlobalParameter.SYSTEM_PERMISSIONS_LIST}' were provided in the parameters.`);
        }
        if (!Array.isArray(permissionFields)) {
            throw new Error(`DatasetCurrentUserPermissions: '${OrgCheckGlobalParameter.SYSTEM_PERMISSIONS_LIST}' parameter should be an array of permission names.`);
        }

        // First SOQL query
        logger?.log(`Querying REST API about UserPermissionAccess in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: `SELECT ${permissionFields.map(p => `Permissions${p}`).join(`, `)} ` +
                    'FROM UserPermissionAccess '+
                    'LIMIT 1'
        }], logger);
        const permissions = results[0][0];
        logger?.log(`Parsing the results...`);            

        // Return data as map
        return new Map(await Processor.map(
            Object.keys(permissions),
            (field) => [ field, permissions[field] ],
            (field) => field.startsWith('Permissions')
        ));
    } 
}