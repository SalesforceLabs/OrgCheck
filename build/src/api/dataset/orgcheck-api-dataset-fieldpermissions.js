import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processing';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_FieldPermission } from '../data/orgcheck-api-data-fieldpermission';

export class DatasetFieldPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager
     * @param {DataFactoryIntf} dataFactory
     * @param {SimpleLoggerIntf} logger
     * @param {Map} parameters
     * @returns {Promise<Map<string, SFDC_FieldPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = parameters?.get('object');

        // First SOQL query
        logger?.log(`Querying REST API about SetupEntityAccess for TabSet in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Field, PermissionsRead, PermissionsEdit, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId ' +
                    'FROM FieldPermissions '+
                    `WHERE SObjectType = '${fullObjectApiName}' `
        }], logger);

        // Init the factory and records
        const fieldPermissionDataFactory = dataFactory.getInstance(SFDC_FieldPermission);
        const permissions = results[0];

        // Create the map
        logger?.log(`Parsing ${permissions.length} Field Permissions...`);
        const fieldPermissions = new Map(await Processor.map(permissions, 
            (record) => {
                // Get the ID15 of this parent
                const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile ? record.Parent.ProfileId : record.ParentId);

                // Create the instance
                const fieldPermission = fieldPermissionDataFactory.create({
                    properties: {
                        fieldApiName: record.Field,
                        parentId: parentId,
                        isRead: record.PermissionsRead,
                        isEdit: record.PermissionsEdit
                    }
                });

                // Add the app in map
                return [ `${record.Field}-${parentId}`, fieldPermission ];
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return fieldPermissions;
    }
}