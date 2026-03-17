import { DataAliases } from 'src/api/core/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/orgcheck-api-salesforcemanager';
import { SfdcValidationRule } from 'src/api/data/orgcheck-api-data-validationrule';

export class DatasetValidationRules implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - List of optional argument to pass
     * @returns {Promise<Map<string, SfdcValidationRule>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcValidationRule>> {

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
        const validationRuleDataFactory = dataFactory.getInstance(DataAliases.SfdcValidationRule);

        // Create the map
        const validationRuleRecords = results[0];
        logger?.log(`Parsing ${validationRuleRecords?.length} validation rules...`);
        const validationRules: Map<string, SfdcValidationRule> = new Map(await Processor.map(validationRuleRecords, async (/** @type {any} */ record: any) => {
        
            // Get the ID15 of this validaiton rule
            const id = sfdcManager.caseSafeId(record.Id);

            // Create the instance
            /** @type {SfdcValidationRule} */
            const validationRule: SfdcValidationRule = validationRuleDataFactory.createWithScore({
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