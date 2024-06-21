import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';

export class OrgCheckDatasetLightningPages extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about FlexiPage in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                        'Type, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate '+
                    'FROM FlexiPage '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
        }], localLogger);

        // Init the factory and records
        const pageDataFactory = dataFactory.getInstance(SFDC_LightningPage);
        const pageRecords = results[0].records;

        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${pageRecords.length} lightning pages...`);
        const dependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.carte(pageRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            localLogger
        );

        // Create the map
        localLogger.log(`Parsing ${pageRecords.length} lightning pages...`);
        const pages = new Map(await OrgCheckProcessor.carte(pageRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const page = pageDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('lightning-page', record.Id),
                name: record.MasterLabel,
                apiVersion: record.ApiVersion,
                package: (record.NamespacePrefix || ''),
                createdDate: record.CreatedDate,
                lastModifiedDate: record.LastModifiedDate,
                description: record.Description,
                allDependencies: dependencies
            });

            // Add it to the map  
            return [ page.id, page ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return pages;
    } 
}