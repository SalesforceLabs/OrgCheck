import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_FieldPermission } from '../data/orgcheck-api-data-fieldpermission';

export class DatasetFieldPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @param {Map<string, any>} parameters - The parameters
     * @returns {Promise<Map<string, SFDC_FieldPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger, parameters) {

        const fullObjectApiName = OrgCheckGlobalParameter.getSObjectName(parameters);

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
            (/** @type {any} */ record) => {
                // Get the ID15 of this parent
                const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile === true ? record.Parent.ProfileId : record.ParentId);

                // Get only the name of the field without the object name (and by the way without dot
                const indeOfDot = record.Field.indexOf('.');
                const fieldName = indeOfDot === -1 ? record.Field : record.Field.substring(indeOfDot + 1);

                // Create the instance
                /** @type {SFDC_FieldPermission} */
                const fieldPermission = fieldPermissionDataFactory.create({
                    properties: {
                        fieldApiName: fieldName,
                        parentId: parentId,
                        isRead: record.PermissionsRead,
                        isEdit: record.PermissionsEdit
                    }
                });

                // Add the app in map
                return [ `${record.Field}-${parentId}`, fieldPermission ];
            }, 
            (/** @type {any} */ record) => {
                // We do not want records with no Parent structure
                if (!record.Parent) return false;
                // We do not want records with no ParentId
                if (!record.ParentId) return false;
                // We do not want records with parentId not starting with '0PS'
                if (`${record.ParentId}`.startsWith('0PS') === false) return false;
                // We do not want records with no Field
                if (!record.Field) return false;
                // otherwise
                return true;
            }
        ));
        // Return data as map
        logger?.log(`Done`);
        return fieldPermissions;
    }
}