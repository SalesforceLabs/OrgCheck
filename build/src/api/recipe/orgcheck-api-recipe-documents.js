import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Document } from '../data/orgcheck-api-data-document';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeDocuments extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
        return [DatasetAliases.DOCUMENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_Document>} */ documents = data.get(DatasetAliases.DOCUMENTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!documents) throw new Error(`RecipeDocuments: Data from dataset alias 'DOCUMENTS' was undefined.`);

        // Filter data
        /** @type {Array<SFDC_Document>} */
        const array = [];
        await Processor.forEach(documents, (/** @type {SFDC_Document} */ document) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || document.package === namespace) {
                array.push(document);
            }
        });

        // Return data
        return array;
    }
}