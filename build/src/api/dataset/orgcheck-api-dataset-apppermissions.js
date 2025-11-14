import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';

export class DatasetAppPermissions extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_AppPermission>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying REST API about SetupEntityAccess for TabSet in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT ApplicationId, IsAccessible, IsVisible '+
                    'FROM AppMenuItem ' +
                    'WHERE Type = \'TabSet\' '
        }, {
            string: 'SELECT SetupEntityId, ParentId, Parent.IsOwnedByProfile, Parent.ProfileId ' +
                    'FROM SetupEntityAccess ' +
                    'WHERE SetupEntityType = \'TabSet\' '
        }], logger);

        // Init the factory and records
        const appPermissionDataFactory = dataFactory.getInstance(SFDC_AppPermission);
        const appMenuItems = results[0];
        const setupEntityAccesses = results[1];

        // Create a map of the app menu items
        logger?.log(`Parsing ${appMenuItems.length} Application Menu Items...`);
        const appMenuItemAccesses = new Map(await Processor.map(appMenuItems, (/** @type {any} */ record) => {
            return [ sfdcManager.caseSafeId(record.ApplicationId), { a: record.IsAccessible, v: record. IsVisible }] ;
        }));

        // Create the map
        logger?.log(`Parsing ${setupEntityAccesses.length} Setup Entity Accesses...`);
        const appPermissions = new Map(await Processor.map(setupEntityAccesses, 
            (/** @type {any} */ record) => {
                // Get the ID15 of this application
                const appId = sfdcManager.caseSafeId(record.SetupEntityId);
                const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile ? record.Parent.ProfileId : record.ParentId);

                // Get the appMenuItemAccesses
                const accesses = appMenuItemAccesses.get(appId);

                // Create the instance
                /** @type {SFDC_AppPermission} */
                const appPermission = appPermissionDataFactory.create({
                    properties: {
                        appId: appId,
                        parentId: parentId,
                        isAccessible: accesses.a,
                        isVisible: accesses.v
                    }
                });

                // Add the app in map
                return [ `${appId}-${parentId}`, appPermission ];
            }, 
            (/** @type {any} */ record) => { 
                // Make sure we only get the access for Application that have in AppMenuItem
                return appMenuItemAccesses.has(sfdcManager.caseSafeId(record.SetupEntityId));
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return appPermissions;
    }
}