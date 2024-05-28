import { OrgCheckDataset } from '../core/orgcheck-api-dataset';

export class OrgCheckDatasetCurrentUserPermissions extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger, parameters) {

        const permissionFields = parameters.get('permissions');

        // First SOQL query
        localLogger.log(`Querying REST API about UserPermissionAccess in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: `SELECT ${permissionFields.map(p => `Permissions${p}`).join(`, `)} FROM UserPermissionAccess LIMIT 1`
        }], localLogger);
        const permissions = results[0].records[0];
        localLogger.log(`Parsing the results...`);            

        // Return data as map
        return new Map(Object.keys(permissions).filter(n => n.startsWith('Permissions')).map(p => [ p, permissions[p] ]));
    } 
}