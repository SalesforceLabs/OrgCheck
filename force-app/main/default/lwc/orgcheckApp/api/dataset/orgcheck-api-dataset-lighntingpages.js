import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';

export class OrgCheckDatasetLightningPages extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on CustomField
        sfdcManager.soqlQuery([{ 
            tooling: true,
            string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                        'Type, NamespacePrefix, Description, ' +
                        'CreatedDate, LastModifiedDate '+
                    'FROM FlexiPage '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            addDependenciesBasedOnField: 'Id'
        }]).then((results) => {

            // Init the map
            const pages = new Map();

            // Init the factory
            const pageDataFactory = dataFactory.getInstance(SFDC_LightningPage);

            // Set the map
            localLogger.log(`Parsing ${results[0].records.length} Flexi Pages...`);
            results[0].records
                .forEach((record) => {

                    // Get the ID15 of this custom field
                    const id = sfdcManager.caseSafeId(record.Id);

                    // Create the instance
                    const page = pageDataFactory.create({
                        id: id,
                        url: sfdcManager.setupUrl('lightning-page', record.Id),
                        name: record.MasterLabel,
                        apiVersion: record.ApiVersion,
                        package: record.NamespacePrefix,
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        description: record.Description,
                        allDependencies: results[0].allDependencies
                    });

                    // Compute the score of this item
                    pageDataFactory.computeScore(page);
                    /*
                    if (sfdcManager.isEmpty(page.description)) page.setBadField('description');
                    if (page.isItReferenced() === false) page.setBadField('dependencies.referenced');
                    */

                    // Add it to the map  
                    pages.set(page.id, page);
                });

            // Return data
            resolve(pages);
        }).catch(reject);
    } 
}