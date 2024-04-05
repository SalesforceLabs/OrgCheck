import { OrgCheckDataset } from '../core/orgcheck-api-dataset';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';

const REGEX_HASSOQL = new RegExp("\\[\\s*(?:SELECT|FIND)");
const REGEX_HASDML = new RegExp("(?:insert|update|delete)\\s*(?:\\s\\w+|\\(|\\[)");

export class OrgCheckDatasetApexTriggers extends OrgCheckDataset {

    run(sfdcManager, dataFactory, localLogger, resolve, reject) {

        // SOQL query on Apex Classes, Apex Coverage and Apex Jobs
        sfdcManager.soqlQuery([{
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
        }]).then((results) => {

            // Init the map
            const triggersMap = new Map();

            // Init the factory
            const apexTriggerDataFactory = dataFactory.getInstance(SFDC_ApexTrigger);

            // Set the map

            // Part 1- define the apex classes
            localLogger.log(`Parsing ${results[0].records.length} Apex Triggers...`);
            results[0].records
                .forEach((record) => {
                    const apexTrigger = apexTriggerDataFactory.create({
                        id: sfdcManager.caseSafeId(record.Id),
                        url: sfdcManager.setupUrl('apex-trigger', record.Id),
                        name: record.Name,
                        apiVersion: record.ApiVersion,
                        package: record.NamespacePrefix,
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
                    /*
                    if (sfdcManager.isVersionOld(apexTrigger.apiVersion)) apexTrigger.setBadField('apiVersion');
                    if (apexTrigger.hasSOQL === true) apexTrigger.setBadField('hasSOQL');
                    if (apexTrigger.hasDML === true) apexTrigger.setBadField('hasDML');
                    if (apexTrigger.length > 5000) apexTrigger.setBadField('length');
                    if (apexTrigger.isItReferenced() === false) apexTrigger.setBadField('dependencies.referenced');
                    */

                    // Add it to the map  
                    triggersMap.set(apexTrigger.id, apexTrigger);
                });

            // Return data
            resolve(triggersMap);
        }).catch(reject);
    } 
}