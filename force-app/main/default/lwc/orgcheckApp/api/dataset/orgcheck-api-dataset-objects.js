import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_Object } from '../data/orgcheck-api-data-object';

export class OrgCheckDatasetObjects extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // Init the factory and records
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

        // Two actions to perform in parallel, global describe and an additional entity definition soql query
        localLogger.log(`Performing a global describe and in parallel a SOQL query to EntityDefinition...`);            
        const results = await Promise.all([
            
            // Requesting information from the current salesforce org
            sfdcManager.describeGlobal(), // not using tooling api !!!

            // Some information are not in the global describe, we need to append them with EntityDefinition soql query
            sfdcManager.soqlQuery([{ 
                queryMore: false, // entityDef does not support calling QueryMore
                uniqueFieldName: 'DurableId', // unique field name (to be used by the custom QueryMore)
                string: 'SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, '+
                            'ExternalSharingModel, InternalSharingModel '+
                        'FROM EntityDefinition '+
                        'WHERE keyPrefix <> null '+
                        'AND DeveloperName <> null '+ 
                        `AND (NOT(keyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) `
                            // 00a	*Comment for custom objects
                            // 017	*History for custom objects
                            // 02c	*Share for custom objects
                            // 0D5	*Feed for custom objects
                            // 1CE	*Event for custom objects
                    }])
        ])

        const objectsDescription = results[0]; 
        const entities = results[1][0].records;
        const entitiesByName = {};
        const qualifiedApiNames = await OrgCheckProcessor.carte(
            entities, 
            (record) => { 
                entitiesByName[record.QualifiedApiName] = record; 
                return record.QualifiedApiName;
            }
        );

        // Create the map
        localLogger.log(`Parsing ${objectsDescription.length} custom labels...`);

        const objects = new Map(await OrgCheckProcessor.carte(
            await OrgCheckProcessor.filtre(
                objectsDescription, 
                (object) => {
                    return qualifiedApiNames.includes(object.name) && 
                           sfdcManager.getObjectType(object.name, object.customSetting) ? true : false;
                }
            ),
            (object) => {
                const type = sfdcManager.getObjectType(object.name, object.customSetting)
                const entity = entitiesByName[object.name];

                // Create the instance
                const obj = objectDataFactory.create({
                    id: object.name,
                    label: object.label,
                    name: entity.DeveloperName,
                    apiname: object.name,
                    url: sfdcManager.setupUrl('object', '', entity.DurableId, type),
                    package: (entity.NamespacePrefix || ''),
                    typeId: type,
                    externalSharingModel: entity.ExternalSharingModel,
                    internalSharingModel: entity.InternalSharingModel
                });

                // Add it to the map  
                return [ obj.id, obj ];
            }
        ));

        // Return data as map
        localLogger.log(`Done`);
        return objects;
    } 
}