import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';

export class RecipeProfileRestrictions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.PROFILES,
            DatasetAliases.PROFILERESTRICTIONS
        ];
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
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_ProfileRestrictions>} */ profileRestrictions = data.get(DatasetAliases.PROFILERESTRICTIONS);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!profileRestrictions) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILERESTRICTIONS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await Processor.forEach(profileRestrictions, (restriction) => {
            // Augment data
            restriction.profileRef = profiles.get(restriction.profileId);
            // Filter data
            if (namespace === '*' || restriction.profileRef?.package === namespace) {
                array.push(restriction);
            }
        });

        // Return data
        return array;
    }
}