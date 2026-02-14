import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_ProfileRestrictions } from '../data/orgcheck-api-data-profilerestrictions';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeProfileRestrictions implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PROFILES,
            DatasetAliases.PROFILERESTRICTIONS
        ];
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
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_Profile>} */ profiles: Map<string, SFDC_Profile> = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_ProfileRestrictions>} */ profileRestrictions: Map<string, SFDC_ProfileRestrictions> = data.get(DatasetAliases.PROFILERESTRICTIONS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!profileRestrictions) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILERESTRICTIONS' was undefined.`);

        // Augment and Filter data
        /** @type {Array<SFDC_ProfileRestrictions>} */
        const array: Array<SFDC_ProfileRestrictions> = [];
        await Processor.forEach(profileRestrictions, (/** @type {SFDC_ProfileRestrictions} */ restriction: SFDC_ProfileRestrictions) => {
            // Augment data
            restriction.profileRef = profiles.get(restriction.profileId);
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || restriction.profileRef?.package === namespace) {
                array.push(restriction);
            }
        });

        // Return data
        return array;
    }
}