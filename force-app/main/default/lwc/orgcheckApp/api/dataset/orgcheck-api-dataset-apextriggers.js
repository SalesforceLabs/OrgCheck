import { OrgCheckDataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckSalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { OrgCheckSalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';

const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\n)', 'gi');
const REGEX_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");

export class OrgCheckDatasetApexTriggers extends OrgCheckDataset {

    /**
     * @description Run the dataset and return the result
     * @param {OrgCheckSalesforceManagerIntf} sfdcManager
     * @param {OrgCheckDataFactoryIntf} dataFactory
     * @param {OrgCheckSimpleLoggerIntf} logger
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
            tooling: true,
            byPasses: [],
            queryMoreField: ''
        }], logger);

        // Init the factory and records
        const apexTriggerDataFactory = dataFactory.getInstance(SFDC_ApexTrigger);
        const apexTriggerRecords = results[0].records;

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggersDependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.map(apexTriggerRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            logger
        );

        // Create the map
        logger?.log(`Parsing ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggers = new Map(await OrgCheckProcessor.map(
            apexTriggerRecords,
            (record) => {

                // Get the ID15
                const id = sfdcManager.caseSafeId(record.Id);

                // Create the instance
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
                        url: sfdcManager.setupUrl(id, OrgCheckSalesforceMetadataTypes.APEX_TRIGGER, record.EntityDefinition?.QualifiedApiName)
                    }, 
                    dependencies: {
                        data: apexTriggersDependencies
                    }
                });
                
                // Get information directly from the source code (if available)
                if (record.Body) {
                    const sourceCode = record.Body.replaceAll(REGEX_COMMENTS_AND_NEWLINES, ' ');
                    apexTrigger.hasSOQL = sourceCode.match(REGEX_HASSOQL) !== null; 
                    apexTrigger.hasDML = sourceCode.match(REGEX_HASDML) !== null; 
                }

                // Compute the score of this item
                apexTriggerDataFactory.computeScore(apexTrigger);

                // Add it to the map  
                return [ apexTrigger.id, apexTrigger ];
            },
            (record)=> (record.EntityDefinition ? true : false)
        ));

        // Return data as map
        logger?.log(`Done`);
        return apexTriggers;
    } 
}