import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';

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
                        'EntityDefinition.QualifiedApiName, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ApexTrigger '+
                    'WHERE ManageableState IN (\'installedEditable\', \'unmanaged\') ',
            tooling: true,
            addDependenciesBasedOnField: 'Id'
        }], localLogger);

        // Init the factory
        const apexTriggerDataFactory = dataFactory.getInstance(SFDC_ApexTrigger);

        // Create the map
        localLogger.log(`Parsing ${results[0].records.length} apex triggers...`);
        const apexTriggers = new Map(results[0].records.map((record) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            const apexTrigger = apexTriggerDataFactory.create({
                id: id,
                url: sfdcManager.setupUrl('apex-trigger', id),
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
                allDependencies: results[0].allDependencies
            });
            
            // Get information directly from the source code (if available)
            if (record.Body) {
                apexTrigger.hasSOQL = record.Body.match(REGEX_HASSOQL) !== null; 
                apexTrigger.hasDML = record.Body.match(REGEX_HASDML) !== null; 
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