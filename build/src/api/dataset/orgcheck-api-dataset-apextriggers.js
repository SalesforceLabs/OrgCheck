import { CodeScanner } from '../core/orgcheck-api-codescanner';
import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';

export class DatasetApexTriggers extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_ApexTrigger>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about ApexTrigger in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, Status, ' +
                        'NamespacePrefix, Body, ' +
                        'UsageBeforeInsert, UsageAfterInsert, ' +
                        'UsageBeforeUpdate, UsageAfterUpdate, ' +
                        'UsageBeforeDelete, UsageAfterDelete, ' +
                        'UsageAfterUndelete, UsageIsBulk, ' +
                        'LengthWithoutComments, ' +
                        'EntityDefinition.QualifiedApiName, ' +
                        'CreatedDate, LastModifiedDate ' +
                    'FROM ApexTrigger ' +
                    `WHERE ManageableState IN ('installedEditable', 'unmanaged') `,
            tooling: true
        }], logger);

        // Init the factory and records
        const apexTriggerDataFactory = dataFactory.getInstance(SFDC_ApexTrigger);
        const apexTriggerRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggersDependencies = await sfdcManager.dependenciesQuery(
            await Processor.map(apexTriggerRecords, (/** @type {any} */ record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggers = new Map(await Processor.map(
            apexTriggerRecords,
            (/** @type {any} */ record) => {

                // Get the ID15
                const id = sfdcManager.caseSafeId(record.Id);

                // Create the instance
                /** @type {SFDC_ApexTrigger} */
                const apexTrigger = apexTriggerDataFactory.create({
                    properties: {
                        id: id,
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: (record.NamespacePrefix || ''),
                        length: record.LengthWithoutComments,
                        isActive: (record.Status === 'Active' ? true : false),
                        beforeInsert: record.UsageBeforeInsert,
                        afterInsert: record.UsageAfterInsert,
                        beforeUpdate: record.UsageBeforeUpdate,
                        afterUpdate: record.UsageAfterUpdate,
                        beforeDelete: record.UsageBeforeDelete,
                        afterDelete: record.UsageAfterDelete,
                        afterUndelete: record.UsageAfterUndelete,
                        objectId: sfdcManager.caseSafeId(record.EntityDefinition?.QualifiedApiName),
                        hasSOQL: false,
                        hasDML: false,
                        createdDate: record.CreatedDate,
                        lastModifiedDate: record.LastModifiedDate,
                        url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.APEX_TRIGGER, record.EntityDefinition?.QualifiedApiName)
                    }, 
                    dependencyData: apexTriggersDependencies
                });
                
                // Get information directly from the source code (if available)
                if (record.Body) {
                    const sourceCode = CodeScanner.RemoveCommentsFromCode(record.Body);
                    apexTrigger.hasSOQL = CodeScanner.HasSOQLFromApexCode(sourceCode); 
                    apexTrigger.hasDML = CodeScanner.HasDMLFromApexCode(sourceCode); 
                    apexTrigger.hardCodedURLs = CodeScanner.FindHardCodedURLs(sourceCode);
                    apexTrigger.hardCodedIDs = CodeScanner.FindHardCodedIDs(sourceCode);
                }

                // Compute the score of this item
                apexTriggerDataFactory.computeScore(apexTrigger);

                // Add it to the map  
                return [ apexTrigger.id, apexTrigger ];
            },
            (/** @type {any} */ record)=> (record.EntityDefinition ? true : false)
        ));

        // Return data as map
        logger?.log(`Done`);
        return apexTriggers;
    } 
}