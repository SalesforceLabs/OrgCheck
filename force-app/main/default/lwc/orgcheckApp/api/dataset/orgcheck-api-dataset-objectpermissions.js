import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ObjectPermission } from '../data/orgcheck-api-data-objectpermission';

export class OrgCheckDatasetObjectPermissions extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject) {

        // SOQL query on ObjectPermissions
        sfdcManager.soqlQuery([{ 
            string: 'SELECT ParentId, Parent.IsOwnedByProfile, Parent.ProfileId, SobjectType, '+
                        'CreatedDate, LastModifiedDate,PermissionsRead, PermissionsCreate, '+
                        'PermissionsEdit, PermissionsDelete, PermissionsViewAllRecords, '+
                        'PermissionsModifyAllRecords '+
                    'FROM ObjectPermissions'
        }]).then((results) => {

            // Init the map
            const permissions = new Map();

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Profiles...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of the parent (profile or permission set)
                    const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile === true ? record.Parent.ProfileId : record.ParentId);

                    // Create the instance
                    const permission = new SFDC_ObjectPermission({
                        key: `${record.SobjectType}_${parentId}`,
                        parentId: parentId,
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
                    permissions.set(permission.key, permission);                    
                });

            // Return data
            resolve(permissions);
        }).catch(reject);
    } 
}