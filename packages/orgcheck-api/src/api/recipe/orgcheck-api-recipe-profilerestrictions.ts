import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcProfile }from 'src/api/data/orgcheck-api-data-profile';
import { SfdcProfileRestrictions }from 'src/api/data/orgcheck-api-data-profilerestrictions';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';

export class RecipeProfileRestrictions implements Recipe<SfdcProfileRestrictions[]> {

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
     * @returns {Promise<SfdcProfileRestrictions[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcProfileRestrictions[]> {

        // Get data and parameters
        const profiles: Map<string, SfdcProfile> = data.get(DatasetAliases.PROFILES);
        const profileRestrictions: Map<string, SfdcProfileRestrictions> = data.get(DatasetAliases.PROFILERESTRICTIONS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!profileRestrictions) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILERESTRICTIONS' was undefined.`);

        // Augment and Filter data
        const array: Array<SfdcProfileRestrictions> = [];
        await Processor.forEach(profileRestrictions, async (restriction: SfdcProfileRestrictions) => {
            // Augment data
            const profileRef = profiles.get(restriction.profileId);
            if (profileRef) {
                restriction.profileRef = profileRef;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || restriction.profileRef?.package === namespace) {
                array.push(restriction);
            }
        });

        // Return data
        return array;
    }
}