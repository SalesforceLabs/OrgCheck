import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';

export class DatasetValidationRules extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - List of optional argument to pass
     * @returns {Promise<Map<string, SFDC_ValidationRule>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

        // First SOQL query
        logger?.log(`Querying Tooling API about Validaiton Rules in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Active, Description, ErrorDisplayField, ErrorMessage, '+
                        'ValidationName, EntityDefinition.QualifiedApiName, NamespacePrefix, '+
                        'CreatedDate, LastModifiedDate '+
                    'FROM ValidationRule',
            tooling: true
        }], logger);

        // Init the factory and records
        const validationRuleDataFactory = dataFactory.getInstance(SFDC_ValidationRule);

        // Create the map
        const validationRuleRecords = results[0];
        logger?.log(`Parsing ${validationRuleRecords.length} validation rules...`);
        const validationRules = new Map(await Processor.map(validationRuleRecords, async (/** @type {any} */ record) => {
        
            // Get the ID15 of this validaiton rule
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SFDC_ValidationRule} */
            const validationRule = validationRuleDataFactory.createWithScore({
                properties: {
                    id: sfdcManager.caseSafeId(id), 
                    name: record.ValidationName, 
                    isActive: record.Active,
                    package: (record.NamespacePrefix || ''),
                    description: record.Description,
                    errorDisplayField: record.ErrorDisplayField,
                    errorMessage: record.ErrorMessage,
                    objectId: record.EntityDefinition?.QualifiedApiName,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate, 
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.VALIDATION_RULE)
                }
            });

            // Add it to the map  
            return [ validationRule.id, validationRule ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return validationRules;
    } 
}