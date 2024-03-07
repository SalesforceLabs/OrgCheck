import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';

export class OrgCheckDatasetAppPermissions extends OrgCheckDataset {

    run(sfdcManager, localLogger, resolve, reject) {

        // SOQL query on AppMenuItem and SetupEntityAccess
        // Thanks to SimplySFDC: https://www.simplysfdc.com/2018/04/salesforce-app-visibility-and-query.html
        sfdcManager.soqlQuery([{ 
            string: 'SELECT ApplicationId, Name, Label, NamespacePrefix, IsAccessible, IsVisible '+
                    'FROM AppMenuItem '+
                    'WHERE Type = \'TabSet\' '
        }, { 
            string: 'SELECT SetupEntityId, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId '+
                    'FROM SetupEntityAccess '+
                    'WHERE SetupEntityType = \'TabSet\' '
        }]).then((results) => {

            // Init the maps
            const permissions = new Map();
            const applications = new Map();

            // Set the application map (as reference)
            localLogger.log(`Parsing ${results[0].records.length} Application Menu Items...`);
            results[0].records // records from AppMenuItem
                .forEach((record) => {
                    // Get the ID15 of this application
                    const id = sfdcManager.caseSafeId(record.ApplicationId);
                    // Add the app in map
                    applications.set(id, {
                        name: record.Name, 
                        label: record.Label, 
                        package: record.NamespacePrefix,
                        isAccessible: record.IsAccessible,
                        isVisible: record.IsVisible
                    });
                });

            // Set the map
            localLogger.log(`Parsing ${results[1].records.length} Setup Entity Accesses...`);
            results[1].records // records from SetupEntityAccess
                .forEach((record) => {
                    const appId = sfdcManager.caseSafeId(record.SetupEntityId);
                    // Application must be one that we know about...
                    if (applications.has(appId)) {
                        const app = applications.get(appId);
                        // Create the instance
                        const permission = new SFDC_AppPermission({
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
                        permissions.set(`${permission.parentId}_${permission.appId}`, permission);
                    }
                });

            // Return data
            resolve(permissions);
        }).catch(reject);
    } 
}