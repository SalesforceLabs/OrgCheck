import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { TYPE_VISUAL_FORCE_COMPONENT } from '../core/orgcheck-api-sfconnectionmanager';
import { SFDC_VisualForceComponent } from '../data/orgcheck-api-data-visualforcecomponent';

export class OrgCheckDatasetVisualForceComponents extends OrgCheckDataset {
    
    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about ApexComponent in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexComponent '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') '
        }], localLogger);

        // Init the factory and records
        const componentDataFactory = dataFactory.getInstance(SFDC_VisualForceComponent);
        const componentRecords = results[0].records;

        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${componentRecords.length} custom labels...`);
        const componentsDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(componentRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            localLogger
        );

        // Create the map
        localLogger.log(`Parsing ${componentRecords.length} visualforce components...`);
        const components = new Map(await OrgCheckProcessor.map(componentRecords, (record) => {

            // Get the ID15 of this custom field
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const component = componentDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    apiVersion: record.ApiVersion,
                    package: (record.NamespacePrefix || ''),
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    description: record.Description,
                    url: sfdcManager.setupUrl(id, TYPE_VISUAL_FORCE_COMPONENT)
                }, 
                dependencies:{
                    data: componentsDependencies
                }
            });

            // Add it to the map  
            return [ component.id, component ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return components;
    } 
}