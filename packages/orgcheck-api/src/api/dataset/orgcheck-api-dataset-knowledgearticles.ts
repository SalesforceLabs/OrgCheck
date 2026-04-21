import { DataAliases } from 'src/api/core/data/orgcheck-api-data-aliases';
import { DataFactoryIntf } from 'src/api/core/data/orgcheck-api-datafactory';
import { Dataset } from 'src/api/core/dataset/orgcheck-api-dataset';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from 'src/api/core/salesforce/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from 'src/api/core/salesforce/orgcheck-api-salesforcemanager';
import { SfdcKnowledgeArticle } from 'src/api/data/orgcheck-api-data-knowledgearticle';

export class DatasetKnowledgeArticles implements Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SfdcKnowledgeArticle>>} The result of the dataset
     */
    async run(sfdcManager: SalesforceManagerIntf, dataFactory: DataFactoryIntf, logger: SimpleLoggerIntf): Promise<Map<string, SfdcKnowledgeArticle>> {

        // First SOSL query
        logger?.log(`Querying SOSL about published KnowledgeArticleVersion containing Salesforce domains...`);            
        const results = await sfdcManager.soslQuery([{
            string: 'FIND { .salesforce.com OR .force.* } IN ALL FIELDS ' +
                    'RETURNING KnowledgeArticleVersion ('+
                        'Id, KnowledgeArticleId, ArticleNumber, CreatedDate, LastModifiedDate, '+
                        'PublishStatus, Title, UrlName '+
                    ')',
            byPasses: ['INVALID_TYPE'], // in some org KnowledgeArticleVersion is not defined!
        }], logger);

        // Init the factory and records
        const knowledgeArticleDataFactory = dataFactory.getInstance(DataAliases.SfdcKnowledgeArticle);
        const knowledgeArticleRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${knowledgeArticleRecords?.length} articles...`);
        const knowledgeArticles: Map<string, SfdcKnowledgeArticle> = new Map(await MediumProcessor.map(knowledgeArticleRecords, (record: any) => {

            // Get the ID15 of this version and article
            const versionId = sfdcManager.caseSafeId(record.Id);
            const articeId = sfdcManager.caseSafeId(record.KnowledgeArticleId);

            // Create the instance
            const knowledgeArticle: SfdcKnowledgeArticle = knowledgeArticleDataFactory.createWithScore({
                properties: {
                    id: articeId,
                    number: record.ArticleNumber,
                    versionId: versionId,
                    title: record.Title, 
                    urlName: record.UrlName,
                    status: record.PublishStatus,
                    createdDate: record.CreatedDate,
                    lastModifiedDate: record.LastModifiedDate,
                    isHardCodedURL: true, // All knowledge articles are hard coded URLs in this case
                    url: sfdcManager.setupUrl(versionId, SalesforceMetadataTypes.KNOWLEDGE_ARTICLE_VERSION)          
                }
            });

            // Add it to the map  
            return [ knowledgeArticle.id, knowledgeArticle ];
        }));

        // Return data as map
        logger?.log(`Done`);
        return knowledgeArticles;
    } 
}