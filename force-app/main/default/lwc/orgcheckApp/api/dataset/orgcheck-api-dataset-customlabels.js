import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { TYPE_CUSTOM_LABEL } from '../core/orgcheck-api-sfconnectionmanager';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';

export class OrgCheckDatasetCustomLabels extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about ExternalString in the org...`);            
        const results = await sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ExternalString '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
        }], localLogger);

        // Init the factory and records
        const labelDataFactory = dataFactory.getInstance(SFDC_CustomLabel);
        const customLabelRecords = results[0].records;

        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${customLabelRecords.length} custom labels...`);
        const customLabelsDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(customLabelRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            localLogger
        );
        
        // Create the map
        localLogger.log(`Parsing ${customLabelRecords.length} custom labels...`);
        const customLabels = new Map(await OrgCheckProcessor.map(customLabelRecords, (record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const customLabel = labelDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    package: (record.NamespacePrefix || ''),
                    category: record.Category,
                    isProtected: record.IsProtected === true,
                    language: record.Language,
                    label: record.MasterLabel,
                    value: record.Value,
                    createdDate: record.CreatedDate, 
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, TYPE_CUSTOM_LABEL)
                }, 
                dependencies: {
                    data: customLabelsDependencies
                }
            });

            // Add it to the map  
            return [ customLabel.id, customLabel ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return customLabels;
    } 
}