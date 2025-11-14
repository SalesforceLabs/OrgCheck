import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ObjectPermission } from '../data/orgcheck-api-data-objectpermission';

export class DatasetObjectPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_ObjectPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about ObjectPermissions in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ParentId, Parent.IsOwnedByProfile, Parent.ProfileId, SobjectType, ' +
                        'CreatedDate, LastModifiedDate,PermissionsRead, PermissionsCreate, ' +
                        'PermissionsEdit, PermissionsDelete, PermissionsViewAllRecords, ' +
                        'PermissionsModifyAllRecords ' +
                    'FROM ObjectPermissions'
        }], logger);

        // Init the factory and records
        const permissionDataFactory = dataFactory.getInstance(SFDC_ObjectPermission);

        // Create the map
        const permissionRecords = results[0];
        logger?.log(`Parsing ${permissionRecords.length} object permissions...`);
        const permissions = new Map(await Processor.map(
            permissionRecords,
            (/** @type {any} */ record) => {
                // Create the instance
                /** @type {SFDC_ObjectPermission} */
                const permission = permissionDataFactory.create({
                    properties: {
                        parentId: sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile === true ? record.Parent.ProfileId : record.ParentId),
                        objectType: record.SobjectType,
                        isRead: record.PermissionsRead,
                        isCreate: record.PermissionsCreate,
                        isEdit: record.PermissionsEdit,
                        isDelete: record.PermissionsDelete,
                        isViewAll: record.PermissionsViewAllRecords,
                        isModifyAll: record.PermissionsModifyAllRecords,
                        createdDate: record.CreatedDate, 
                        lastModifiedDate: record.LastModifiedDate,
                    }
                });

                // Add it to the map  
                return [ `${permission.parentId}_${permission.objectType}`, permission ];
            },
            (/** @type {any} */ record) => record.Parent !== null // in some orgs, 'ParentId' is set to a value, BUT 'Parent' is null (because id can't be found!),
        ));

        // Return data as map
        logger?.log(`Done`);
        return permissions;
    } 
}