import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_Object } from '../data/orgcheck-api-data-object';

export class OrgCheckDatasetObjects extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // Init the factory
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

        sfdcManager.soqlQuery([{ 
            string: 'SELECT NamespacePrefix FROM Organization'
        }]).then((results) => {

            // Get the namespace of the org (if any)
            const localNamespace = results[0].records[0].NamespacePrefix;

            // Two actions to perform in parallel, global describe and an additional entity definition soql query
            const promises = [];

            // Requesting information from the current salesforce org
            promises.push(sfdcManager.describeGlobal()); // not using tooling api !!!

            // Some information are not in the global describe, we need to append them with EntityDefinition soql query
            promises.push(sfdcManager.soqlQuery([{ 
                queryMore: false, // entityDef does not support calling QueryMore
                tooling: false, // so not using tooling either!!!
                string: 'SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, '+
                            'ExternalSharingModel, InternalSharingModel '+
                        'FROM EntityDefinition ' +
                        `WHERE PublisherId IN ('System', '<local>', '${localNamespace}') ` +
                        'AND keyPrefix <> null '+
                        'AND DeveloperName <> null '
            }]));
            Promise.all(promises)
                .then((resultss) => {

                    // Init the map
                    const objects = new Map();

                    // Set the map
                    const objectsDescription = resultss[0]; 
                    const entities = resultss[1][0].records;
                    const entitiesByName = {};
                    const qualifiedApiNames = entities.map((record) => { 
                        entitiesByName[record.QualifiedApiName] = record; 
                        return record.QualifiedApiName;
                    });
                    objectsDescription
                        .filter((object) => qualifiedApiNames.includes(object.name))
                        .forEach((object) => {
                            const type = sfdcManager.getObjectType(object.name, object.customSetting)
                            if (!type) return;
                            const entity = entitiesByName[object.name];
                            objects.set(object.name, objectDataFactory.create({
                                id: object.name,
                                label: object.label,
                                name: entity.DeveloperName,
                                apiname: object.name,
                                url: sfdcManager.setupUrl('object', '', entity.DurableId, type),
                                package: (entity.NamespacePrefix || ''),
                                typeId: type,
                                externalSharingModel: entity.ExternalSharingModel,
                                internalSharingModel: entity.InternalSharingModel
                            }));
                        });

                    // Return data
                    resolve(objects);
                })
                .catch(reject)
        }).catch(reject);
    } 
}