import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
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
            addDependenciesBasedOnField: 'Id'
        }], localLogger);

        // Init the factory
        const labelDataFactory = dataFactory.getInstance(SFDC_CustomLabel);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} custom labels...`);
        const customLabels = new Map(results[0].records.map((record) => {

            // Get the ID15 of this custom label
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const customLabel = labelDataFactory.createWithScore({
                id: id,
                url: sfdcManager.setupUrl('custom-label', record.Id),
                name: record.Name,
                package: (record.NamespacePrefix || ''),
                category: record.Category,
                isProtected: record.IsProtected === true,
                language: record.Language,
                label: record.MasterLabel,
                value: record.Value,
                createdDate: record.CreatedDate, 
                lastModifiedDate: record.LastModifiedDate,
                allDependencies: results[0].allDependencies
            });

            // Add it to the map  
            return [ customLabel.id, customLabel ];
        }));

        // Return data as map
        localLogger.log(`Done`);
        return customLabels;
    } 
}