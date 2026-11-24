import { SfdcStaticResource } from 'src/api/data/orgcheck-api-data-staticresource';
import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';

const STATICRESOURCE_IN_FORMULA_REGEX = new RegExp("/resource/(?<staticResource>[A-Za-z0-9_]+)", 'ig');

export class DatasetStaticResources implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcStaticResource>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcStaticResource>> {

        // SOQL query
        logger?.log(`Querying REST API about StaticResource in the org...`);            
        const results = await sfdcManager.soqlQuery([{
            string: 'SELECT Id, Name, ContentType, CreatedDate, LastModifiedDate, '+
                        'Description, NamespacePrefix '+
                    'FROM StaticResource '
        }, {
            string: 'SELECT DurableId, Publisher.IsSalesforce '+
                    'FROM FieldDefinition '+
                    `WHERE DataType = 'Formula (Text)' `+
                    `AND EntityDefinition.QualifiedApiName LIKE '%' `,
            queryMoreField: 'DurableId', // FieldDefinition does not support calling QueryMore, use the custom instead
            tooling: true
        }], logger);

        // Init the factory and records and records
        const staticResourceDataFactory = dataFactory.getInstance(DataAliases.SfdcStaticResource);
        const staticResourceRecords = results[0];
        const textFormulaFieldRecords = results[1];

        logger?.log(`Mapping ${staticResourceRecords?.length} static resources ids and names...`);
        const srIdByName: Map<string, string> = new Map(await MediumProcessor.map(staticResourceRecords, async (record: Record<string, unknown>) => {
            const name = record.Name as string;
            const packageName = record.NamespacePrefix as string;
            const developerName = packageName ? `${packageName}__${name}` : name;
            return [ developerName, sfdcManager.caseSafeId(record.Id as string)];
        }));

        // List text formula fields that may be using static resources in their formula
        const textFormulaFieldIds = textFormulaFieldRecords.map((formulaField: Record<string, unknown>) => {
            if ((formulaField.Publisher as Record<string, unknown>)?.IsSalesforce === false) {
                const durableId = formulaField.DurableId as string;
                if (durableId && durableId.split) {
                    return durableId.split('.').pop() as string;
                }
            }
            return undefined;
        }).filter((id: string | undefined) => id !== undefined);
        const srFieldRelationships = new Map<string, Set<{id: string, name: string}>>();
        (await sfdcManager.readMetadataAtScale('CustomField', textFormulaFieldIds, undefined, logger))
            .forEach((field) => {
                const formula = (field?.Metadata as Record<string, unknown>)?.formula as string;
                if (formula) {
                    Array.from(formula.matchAll(STATICRESOURCE_IN_FORMULA_REGEX))
                        .map((m: RegExpMatchArray) => m?.groups?.['staticResource'] as string)
                        .filter((staticResource: string | undefined) => staticResource !== undefined)
                        .forEach((staticResource: string) => {
                            if (srIdByName.has(staticResource) === true) {
                                const srId = srIdByName.get(staticResource) as string;
                                if (srFieldRelationships.has(srId) === false) {
                                    srFieldRelationships.set(srId, new Set());
                                }
                                srFieldRelationships.get(srId)?.add({
                                    id: field.Id as string, 
                                    name: field.DeveloperName as string
                                });
                            }
                        });
                }
            });

        // Then retreive dependencies
        logger?.log(`Retrieving dependencies of ${staticResourceRecords?.length} static resources...`);
        const staticResourceDependencies = await sfdcManager.dependenciesQuery(
            await MediumProcessor.map(staticResourceRecords, (record: Record<string, unknown>) => {
                return sfdcManager.caseSafeId(record.Id as string);
            }), 
            logger,
            (addUsing, addReferenced) => {
                srFieldRelationships.forEach((fields: Set<{id: string, name: string}>, staticResource: string) => {
                    fields.forEach((field: {id: string, name: string}) => {
                        addReferenced(staticResource, field.id, field.name, SalesforceMetadataTypes.CUSTOM_FIELD);
                    });
                });
            }
        );

        logger?.log(`Parsing ${staticResourceRecords?.length} static resources...`);
        const staticResources: Map<string, SfdcStaticResource> = new Map(await MediumProcessor.map(staticResourceRecords, async (record: Record<string, unknown>) => {

            // Get the ID15
            const id = sfdcManager.caseSafeId(record.Id as string);
            
            // Create the instance
            const staticResource: SfdcStaticResource = staticResourceDataFactory.createWithScore({
                properties: {
                    id: id,
                    name: record.Name,
                    description: record.Description,
                    package: (record.NamespacePrefix || ''),
                    contentType: record.ContentType, 
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    url: sfdcManager.setupUrl(id, SalesforceMetadataTypes.STATIC_RESOURCE)
                }, 
                dependencyData: staticResourceDependencies
            });

            // Add it to the map  
            return [ staticResource.id, staticResource ];
        }));

        // Return data as map
        logger?.log(`Done.`);
        return staticResources;
    } 
}