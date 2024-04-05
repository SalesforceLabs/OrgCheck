import { OrgCheckDataset } from '../core/orgcheck-api-dataset';

export class OrgCheckDatasetCurrentUserPermissions extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL queries on UserPermissionAccess
        sfdcManager.soqlQuery([{ 
            string: 'SELECT FIELDS(STANDARD) FROM UserPermissionAccess LIMIT 1'
        }]).then((results) => {

            // Init the map
            const information = new Map();

            // Set the map
            const permissions = results[0].records[0];
            Object.keys(permissions).filter(n => n.startsWith('Permissions')).forEach(p => information.set(p, permissions[p]));

            // Return data
            resolve(information);
        }).catch(reject);
    } 
}