import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Document } from '../data/orgcheck-api-data-document';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeDocuments extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.DOCUMENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_Document>} */ documents = data.get(DatasetAliases.DOCUMENTS);
        const namespace = parameters?.get('namespace') ?? '*';

        // Checking data
        if (!documents) throw new Error(`RecipeDocuments: Data from dataset alias 'DOCUMENTS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(documents, (document) => {
            if (namespace === '*' || document.package === namespace) {
                array.push(document);
            }
        });

        // Return data
        return array;
    }
}