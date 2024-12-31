import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Object } from '../data/orgcheck-api-data-object';

export class OrgCheckDatasetObjects extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Map<string, SFDC_Object>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // Init the factory and records
        const objectDataFactory = dataFactory.getInstance(SFDC_Object);

        // Two actions to perform in parallel, global describe and an additional entity definition soql query
        logger?.log(`Performing a global describe and in parallel a SOQL query to EntityDefinition...`);            
        const results = await Promise.all([
            
            // Requesting information from the current salesforce org
            sfdcManager.describeGlobal(logger), // not using tooling api !!!

            // Some information are not in the global describe, we need to append them with EntityDefinition soql query
            sfdcManager.soqlQuery([{
                string: 'SELECT DurableId, NamespacePrefix, DeveloperName, QualifiedApiName, ' +
                            'ExternalSharingModel, InternalSharingModel ' +
                        'FROM EntityDefinition ' +
                        'WHERE keyPrefix <> null ' +
                        'AND DeveloperName <> null ' +
                        `AND (NOT(keyPrefix IN ('00a', '017', '02c', '0D5', '1CE')))`,
                            // 00a	*Comment for custom objects
                            // 017	*History for custom objects
                            // 02c	*Share for custom objects
                            // 0D5	*Feed for custom objects
                            // 1CE	*Event for custom objects
                queryMoreField: 'DurableId', // entityDef does not support calling QueryMore, use the custom instead
                tooling: false,
                byPasses: []
            }], logger)
        ]);

        const objectsDescription = results[0]; 
        const entities = results[1][0].records;
        const entitiesByName = {};
        const qualifiedApiNames = await OrgCheckProcessor.map(
            entities, 
            (record) => { 
                entitiesByName[record.QualifiedApiName] = record; 
                return record.QualifiedApiName;
            }
        );

        // Create the map
        logger?.log(`Parsing ${objectsDescription.length} custom labels...`);

        const objects = new Map(await OrgCheckProcessor.map(
            objectsDescription,
            (object) => {
                const type = sfdcManager.getObjectType(object.name, object.customSetting)
                const entity = entitiesByName[object.name];

                // Create the instance
                const obj = objectDataFactory.create({
                    properties: {
                        id: object.name,
                        label: object.label,
                        name: entity.DeveloperName,
                        apiname: object.name,
                        package: (entity.NamespacePrefix || ''),
                        typeId: type,
                        externalSharingModel: entity.ExternalSharingModel,
                        internalSharingModel: entity.InternalSharingModel,
                        url: sfdcManager.setupUrl(entity.DurableId, type)
                    }
                });

                // Add it to the map  
                return [ obj.id, obj ];
            },
            (object) => {
                return qualifiedApiNames.includes(object.name) && 
                       sfdcManager.getObjectType(object.name, object.customSetting) ? true : false;
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return objects;
    } 
}