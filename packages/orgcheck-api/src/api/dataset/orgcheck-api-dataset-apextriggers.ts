import { CodeScanner } from 'src/api/core/orgcheck-api-codescanner';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcApexTrigger } from 'src/api/data/orgcheck-api-data-apextrigger';

export class DatasetApexTriggers implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcApexTrigger>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcApexTrigger>> {

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
        const apexTriggerDataFactory = dataFactory.getInstance(DataAliases.SfdcApexTrigger);
        const apexTriggerRecords = results[0];

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexTriggerRecords?.length} apex triggers...`);
        const apexTriggersDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(apexTriggerRecords, (record: any) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${apexTriggerRecords?.length} apex triggers...`);
        const apexTriggers: Map<string, SfdcApexTrigger> = new Map(await MediumProcessor.map(
            apexTriggerRecords,
            (record: any) => {

                // Get the ID15
                const id = sfdcManager.caseSafeId(record.Id);

                // Create the instance
                const apexTrigger: SfdcApexTrigger = apexTriggerDataFactory.create({
                    properties: {
                        id: id,
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: (record.NamespacePrefix || ''),
                        length: record?.lengthWithoutComments,
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
            (record: any)=> (record.EntityDefinition ? true : false)
        ));

        // Return data as map
        logger?.log(`Done.`);
        return apexTriggers;
    } 
}