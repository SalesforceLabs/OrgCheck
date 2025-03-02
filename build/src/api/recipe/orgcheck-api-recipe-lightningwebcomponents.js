import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_LightningWebComponent } from '../data/orgcheck-api-data-lightningwebcomponent';

export class RecipeLightningWebComponents extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [DatasetAliases.LIGHTNINGWEBCOMPONENTS];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, namespace) {

        // Get data
        const  /** @type {Map<string, SFDC_LightningWebComponent>} */ components = data.get(DatasetAliases.LIGHTNINGWEBCOMPONENTS);

        // Checking data
        if (!components) throw new Error(`Data from dataset alias 'LIGHTNINGWEBCOMPONENTS' was undefined.`);

        // Filter data
        const array = [];
        await Processor.forEach(components, (component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }
}