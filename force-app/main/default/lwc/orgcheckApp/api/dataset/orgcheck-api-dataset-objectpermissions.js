import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ObjectPermission } from '../data/orgcheck-api-data-objectpermission';

export class OrgCheckDatasetObjectPermissions extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying REST API about ObjectPermissions in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT ParentId, Parent.IsOwnedByProfile, Parent.ProfileId, SobjectType, '+
                        'CreatedDate, LastModifiedDate,PermissionsRead, PermissionsCreate, '+
                        'PermissionsEdit, PermissionsDelete, PermissionsViewAllRecords, '+
                        'PermissionsModifyAllRecords '+
                    'FROM ObjectPermissions'
        }], localLogger);

        // Init the factory
        const permissionDataFactory = dataFactory.getInstance(SFDC_ObjectPermission);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} object permissions...`);
        const permissions = new Map(results[0].records
            .filter((record) => record.Parent !== null) // in some orgs, 'ParentId' is set to a value, BUT 'Parent' is null (because id can't be found!)
            .map((record) => {
                // Create the instance
                const permission = permissionDataFactory.create({
                    parentId: sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile === true ? record.Parent.ProfileId : record.ParentId),
                    isParentProfile: record.Parent.IsOwnedByProfile === true,
                    objectType: record.SobjectType,
                    isRead: record.PermissionsRead,
                    isCreate: record.PermissionsCreate,
                    isEdit: record.PermissionsEdit,
                    isDelete: record.PermissionsDelete,
                    isViewAll: record.PermissionsViewAllRecords,
                    isModifyAll: record.PermissionsModifyAllRecords,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                });

                // Add it to the map  
                return [ `${permission.parentId}_${permission.objectType}`, permission ];
            }));

        // Return data as map
        localLogger.log(`Done`);
        return permissions;
    } 
}