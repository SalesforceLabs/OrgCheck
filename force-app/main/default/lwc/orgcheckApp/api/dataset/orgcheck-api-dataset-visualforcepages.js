import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';

export class OrgCheckDatasetVisualForcePages extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about ApexPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexPage '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')',
            addDependenciesBasedOnField: 'Id'
        }], localLogger);

        // Init the factory
        const pageDataFactory = dataFactory.getInstance(SFDC_VisualForcePage);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} visualforce pages...`);
        const pages = new Map(results[0].records.map((record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const page = pageDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('visual-force-page', record.Id),
                name: record.Name,
                apiVersion: record.ApiVersion,
                isMobileReady: record.IsAvailableInTouch,
                package: (record.NamespacePrefix || ''),
                createdDate: record.CreatedDate,
                lastModifiedDate: record.LastModifiedDate,
                description: record.Description,
                allDependencies: results[0].allDependencies
            });

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return pages;
    } 
}