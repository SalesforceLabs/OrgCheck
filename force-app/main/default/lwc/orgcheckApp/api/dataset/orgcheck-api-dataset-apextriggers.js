import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';

const REGEX_COMMENTS_AND_NEWLINES = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*\\n|\\n)', 'gi');
const REGEX_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");

export class OrgCheckDatasetApexTriggers extends OrgCheckDataset {

    async run(sfdcManager, dataFactory, localLogger) {

        // First SOQL query
        localLogger.log(`Querying Tooling API about ApexTrigger in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ApiVersion, Status, '+
                        'NamespacePrefix, Body, '+
                        'UsageBeforeInsert, UsageAfterInsert, '+
                        'UsageBeforeUpdate, UsageAfterUpdate, '+
                        'UsageBeforeDelete, UsageAfterDelete, '+
                        'UsageAfterUndelete, UsageIsBulk, '+
                        'LengthWithoutComments, '+
                        'EntityDefinition.QualifiedApiName, EntityDefinition.DurableId, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexTrigger '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            tooling: true
        }], localLogger);

        // Init the factory and records
        const apexTriggerDataFactory = dataFactory.getInstance(SFDC_ApexTrigger);
        const apexTriggerRecords = results[0].records;

        // Then retreive dependencies
        localLogger.log(`Retrieving dependencies of ${apexTriggerRecords.length} apex triggers...`);
        const dependencies = await sfdcManager.dependenciesQuery(
            await OrgCheckProcessor.carte(apexTriggerRecords, (record) => sfdcManager.caseSafeId(record.Id)), 
            localLogger
        );

        // Create the map
        localLogger.log(`Parsing ${apexTriggerRecords.length} apex triggers...`);
        const apexTriggers = new Map(await OrgCheckProcessor.carte(apexTriggerRecords, (record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const apexTrigger = apexTriggerDataFactory.create({
                id: id,
                url: sfdcManager.setupUrl('apex-trigger', id, record.EntityDefinition.DurableId),
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
                objectId: sfdcManager.caseSafeId(record.EntityDefinition.QualifiedApiName),
                hasSOQL: false,
                hasDML: false,
                createdDate: record.CreatedDate,
                lastModifiedDate: record.LastModifiedDate,
                allDependencies: dependencies
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
        }));

        // Return data as map
        localLogger.log(`Done`);
        return apexTriggers;
    } 
}