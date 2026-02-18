import { DataAliases } from '../core/orgcheck-api-data-aliases';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';

export class DatasetAppPermissions implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_AppPermission>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SFDC_AppPermission>> {

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
        const appPermissionDataFactory = dataFactory.getInstance(DataAliases.SFDC_AppPermission);
        const appMenuItems = results[0];
        const setupEntityAccesses = results[1];

        // Create a map of the app menu items
        logger?.log(`Parsing ${appMenuItems?.length} Application Menu Items...`);
        const appMenuItemAccesses: Map<string, { a: boolean, v: boolean }> = new Map(await Processor.map(appMenuItems, (/** @type {any} */ record: any) => {
            return [ sfdcManager.caseSafeId(record.ApplicationId), { a: record.IsAccessible, v: record. IsVisible }] ;
        }));

        // Create the map
        logger?.log(`Parsing ${setupEntityAccesses?.length} Setup Entity Accesses...`);
        const appPermissions: Map<string, SFDC_AppPermission> = new Map(await Processor.map(setupEntityAccesses, 
            (/** @type {any} */ record: any) => {
                // Get the ID15 of this application
                const appId = sfdcManager.caseSafeId(record.SetupEntityId);
                const parentId = sfdcManager.caseSafeId(record.Parent.IsOwnedByProfile ? record.Parent.ProfileId : record.ParentId);

                // Get the appMenuItemAccesses
                const accesses = appMenuItemAccesses.get(appId);

                // Create the instance
                /** @type {SFDC_AppPermission} */
                const appPermission: SFDC_AppPermission = appPermissionDataFactory.create({
                    properties: {
                        appId: appId,
                        parentId: parentId,
                        isAccessible: accesses?.a ?? false,
                        isVisible: accesses?.v ?? false
                    }
                });

                // Add the app in map
                return [ `${appId}-${parentId}`, appPermission ];
            }, 
            (/** @type {any} */ record: any) => { 
                // Make sure we only get the access for Application that have in AppMenuItem
                return appMenuItemAccesses.has(sfdcManager.caseSafeId(record.SetupEntityId));
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return appPermissions;
    }
}