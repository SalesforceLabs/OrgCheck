import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeLightningPages extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.LIGHTNINGPAGES,
            DatasetAliases.OBJECTS
        ];
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
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(DatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!pages) throw new Error(`RecipeLightningPages: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!objects) throw new Error(`RecipeLightningPages: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        const array = [];
        await Processor.forEach(pages, (page) => {
            // Augment data
            if (page.objectId) {
                // if objectId was specified in the page, get the reference of the object
                page.objectRef = objects.get(page.objectId);
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }
}