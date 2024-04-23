import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_VisualForcePage } from '../data/orgcheck-api-data-visualforcepage';

export class OrgCheckDatasetVisualForcePages extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexPage '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\')',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const visualForcePages = new Map();

            // Init the factory
            const pageDataFactory = dataFactory.getInstance(SFDC_VisualForcePage);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Apex Pages...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const visualForcePage = pageDataFactory.create({
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

                    // Compute the score of this item
                    pageDataFactory.computeScore(visualForcePage);

                    // Add it to the map  
                    visualForcePages.set(visualForcePage.id, visualForcePage);
                });

            // Return data
            resolve(visualForcePages);
        }).catch(reject);
    } 
}