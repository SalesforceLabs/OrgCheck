import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';
import { SFDC_Object } from '../data/orgcheck-api-data-object';

export class OrgCheckRecipeLightningPages extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.LIGHTNINGPAGES,
            OrgCheckDatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(OrgCheckDatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(OrgCheckDatasetAliases.OBJECTS);

        // Checking data
        if (!pages) throw new Error(`Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!objects) throw new Error(`Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment data
        await OrgCheckProcessor.forEach(pages, (page) => {
            if (page.objectId) {
                // if objectId was specified in the page, get the reference of the object
                page.objectRef = objects.get(page.objectId);
            }
        });

        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(pages, (page) => {
            if (namespace === '*' || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }
}