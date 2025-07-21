import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_Object } from '../data/orgcheck-api-data-object';

export class DatasetObjects extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
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
                        `AND (NOT(keyPrefix IN ('00a', '017', '02c', '0D5', '1CE'))) `+
                            // 00a	*Comment for custom objects
                            // 017	*History for custom objects
                            // 02c	*Share for custom objects
                            // 0D5	*Feed for custom objects
                            // 1CE	*Event for custom objects
                        `AND (NOT(QualifiedApiName like '%_hd')) `,
                            // We want to filter out trending historical objects
                tooling: true, // Using Tooling to get the Activity object
                queryMoreField: 'DurableId' // entityDef does not support calling QueryMore, use the custom instead
            }], logger)
        ]);

        const objectsDescription = results[0]; 
        const entities = results[1][0];
        /** @type {any} */ 
        const entitiesByName = {};
        const qualifiedApiNames = await Processor.map(
            entities, 
            (/** @type {any} */ record) => { 
                entitiesByName[record.QualifiedApiName] = record; 
                return record.QualifiedApiName;
            }
        );

        // Create the map
        logger?.log(`Parsing ${objectsDescription.length} objects...`);
        const objects = new Map(await Processor.map(
            objectsDescription,
            (/** @type {any} */ object) => {

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
            (/** @type {any} */ object) => {
                return qualifiedApiNames?.includes(object.name) ? true : false;
            }
        ));

        // Return data as map
        logger?.log(`Done`);
        return objects;
    } 
}