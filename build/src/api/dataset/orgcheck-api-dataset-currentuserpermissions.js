import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';

export class DatasetCurrentUserPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} _dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} parameters - The parameters
     * @returns {Promise<Map<string, boolean>>} The result of the dataset
     */
    async run(sfdcManager, _dataFactory, logger, parameters) {

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
        const permissionFieldsAsInSOQL = permissionFields.map(p => `Permissions${p}`);
        const results = await sfdcManager.soqlQuery(
            permissionFieldsAsInSOQL.map(field => { return {
                string: `SELECT ${field} FROM UserPermissionAccess LIMIT 1`,
                byPasses: ['INVALID_FIELD'] // in case the permission does not exist in this SFDC version
            }; }), logger);
        logger?.log(`Parsing the results...`);    
        const permissionsMap = new Map();
        results.forEach((records, queryIndex) => {
            if (queryIndex < permissionFieldsAsInSOQL.length) {
                const field = permissionFieldsAsInSOQL[queryIndex];
                permissionsMap.set(field, records?.length === 1 ? records[0][field] : undefined);
            }
        });

        // Return data as map
        return permissionsMap;
    } 
}