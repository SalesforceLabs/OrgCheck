import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';

export class OrgCheckRecipeProfileRestrictions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.PROFILES,
            OrgCheckDatasetAliases.PROFILERESTRICTIONS
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
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_ProfileRestrictions>} */ profileRestrictions = data.get(OrgCheckDatasetAliases.PROFILERESTRICTIONS);

        // Checking data
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);
        if (!profileRestrictions) throw new Error(`Data from dataset alias 'PROFILERESTRICTIONS' was undefined.`);

        // Augment and Filter data
        const array = [];
        await OrgCheckProcessor.forEach(profileRestrictions, (restriction) => {
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