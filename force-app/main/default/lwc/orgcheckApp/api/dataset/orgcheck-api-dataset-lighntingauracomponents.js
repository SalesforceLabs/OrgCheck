import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_LightningAuraComponent } from '../data/orgcheck-api-data-lightningauracomponent';

export class OrgCheckDatasetLightningAuraComponents extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about AuraDefinitionBundle in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM AuraDefinitionBundle '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
        }], localLogger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_LightningAuraComponent);
        const componentRecords = results[0].records;

        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${componentRecords.length} custom labels...`);
        const dependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.carte(componentRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            localLogger
        );
        
        // Create the map
        localLogger.log(`Parsing ${componentRecords.length} lightning aura components...`);
        const components = new Map(await OrgCheckProcessor.carte(componentRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const component = componentDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('lightning-aura-component', record.Id),
                name: record.MasterLabel,
                apiVersion: record.ApiVersion,
                package: (record.NamespacePrefix || ''),
                createdDate: record.CreatedDate,
                lastModifiedDate: record.LastModifiedDate,
                description: record.Description,
                allDependencies: dependencies
            });

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return components;
    } 
}