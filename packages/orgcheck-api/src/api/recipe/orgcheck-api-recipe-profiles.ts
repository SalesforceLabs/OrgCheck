import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScore } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeProfiles implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.PROFILES];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_Profile>} */ profiles: Map<string, SFDC_Profile> = data.get(DatasetAliases.PROFILES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfiles: Data from dataset alias 'PROFILES' was undefined.`);

        // Filter data
        /** @type {Array<SFDC_Profile>} */ 
        const array: Array<SFDC_Profile> = [];
        await Processor.forEach(profiles, (/** @type {SFDC_Profile} */ profile: SFDC_Profile) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || profile.package === namespace) {
                array.push(profile);
            }
        });

        // Return data
        return array;
    }
}