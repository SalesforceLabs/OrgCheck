import { DataFactoryIntf } from '../core/orgcheck-api-datafactory';
import { Dataset } from '../core/orgcheck-api-dataset';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { Processor } from '../core/orgcheck-api-processor';
import { SalesforceMetadataTypes } from '../core/orgcheck-api-salesforce-metadatatypes';
import { SalesforceManagerIntf } from '../core/orgcheck-api-salesforcemanager';
import { SFDC_KnowledgeArticle } from '../data/orgcheck-api-data-knowledgearticle';

export class DatasetKnowledgeArticles extends Dataset {

    /**
     * @description Run the dataset and return the result
     * @param {SalesforceManagerIntf} sfdcManager - The salesforce manager to use
     * @param {DataFactoryIntf} dataFactory - The data factory to use
     * @param {SimpleLoggerIntf} logger - Logger
     * @returns {Promise<Map<string, SFDC_KnowledgeArticle>>} The result of the dataset
     */
    async run(sfdcManager, dataFactory, logger) {

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
        const knowledgeArticleDataFactory = dataFactory.getInstance(SFDC_KnowledgeArticle);
        const knowledgeArticleRecords = results[0];

        // Create the map
        logger?.log(`Parsing ${knowledgeArticleRecords.length} articles...`);
        const knowledgeArticles = new Map(await Processor.map(knowledgeArticleRecords, (/** @type {any} */ record) => {

            // Get the ID15 of this version and article
            const versionId = sfdcManager.caseSafeId(record.Id);
            const articeId = sfdcManager.caseSafeId(record.KnowledgeArticleId);

            // Create the instance
            /** @type {SFDC_KnowledgeArticle} */
            const knowledgeArticle = knowledgeArticleDataFactory.createWithScore({
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