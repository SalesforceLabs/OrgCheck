import { Recipe } from '../core/orgcheck-api-recipe';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Document } from '../data/orgcheck-api-data-document';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeKnowledgeArticles extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.KNOWLEDGEARTICLES];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Document>} */ articles = data.get(DatasetAliases.KNOWLEDGEARTICLES);

        // Checking data
        if (!articles) throw new Error(`RecipeDocuments: Data from dataset alias 'KNOWLEDGEARTICLES' was undefined.`);

        // Return data
        return [... articles.values()];
    }
}