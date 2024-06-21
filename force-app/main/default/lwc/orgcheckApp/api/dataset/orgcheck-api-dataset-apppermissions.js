import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';

export class OrgCheckDatasetAppPermissions extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        // Thanks to SimplySFDC: https://www.simplysfdc.com/2018/04/salesforce-app-visibility-and-query.html
        localLogger.log(`Querying REST API about AppMenuItem and SetupEntityAccess in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            string: 'SELECT ApplicationId, Name, Label, NamespacePrefix, IsAccessible, IsVisible '+
                    'FROM AppMenuItem '+
                    'WHERE Type = \'TabSet\' '
        }, { 
            string: 'SELECT SetupEntityId, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId '+
                    'FROM SetupEntityAccess '+
                    'WHERE SetupEntityType = \'TabSet\' '
        }], localLogger);

        // Init the factory and records
        const appPermissionDataFactory = dataFactory.getInstance(SFDC_AppPermission);

        // Set the application map (as reference)
        const applicationRecords = results[0].records;
        localLogger.log(`Parsing ${applicationRecords.length} Application Menu Items...`);
        const applications = new Map(await OrgCheckProcessor.carte(applicationRecords, (record) => {

            // Get the ID15 of this application
            const id = sfdcManager.caseSafeId(record.ApplicationId);

            // Create the app instance
            const application = {
                id: id,
                name: record.Name, 
                label: record.Label, 
                package: (record.NamespacePrefix || ''),
                isAccessible: record.IsAccessible,
                isVisible: record.IsVisible
            };

            // Add the app in map
            return [ id, application ];
        }));

        // Create the map
        const permissionRecords = results[1].records;
        localLogger.log(`Parsing ${permissionRecords.length} setup entity accesses...`);
        const permissions = await OrgCheckProcessor.carte(
            await OrgCheckProcessor.filtre(permissionRecords, (record)=> applications.has(sfdcManager.caseSafeId(record.SetupEntityId))), // Application must be one that we know about... 
            (record) => {
                const appId = sfdcManager.caseSafeId(record.SetupEntityId);
                const app = applications.get(appId);
                
                // Create the instance
                const permission = appPermissionDataFactory.create({
                    parentId: sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile === true ? record.Parent.ProfileId : record.ParentId),
                    isParentProfile: record.Parent.IsOwnedByProfile === true,
                    appId: appId,
                    appName: app.name,
                    appLabel: app.label,
                    appPackage: app.package,
                    isAccessible: app.isAccessible,
                    isVisible: app.isVisible
                });

                // Add it to the map  
                return [ `${permission.parentId}_${permission.appId}`, permission ];
            }
        );

        // Return data as map
        localLogger.log(`Done`);
        return permissions;
    }
}