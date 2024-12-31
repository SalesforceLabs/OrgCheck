import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';

export class OrgCheckRecipePermissionSets extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.PERMISSIONSETS, 
            OrgCheckDatasetAliases.PROFILES
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
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(OrgCheckDatasetAliases.PROFILES);

        // Checking data
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);

        // Augment data
        await OrgCheckProcessor.forEach(permissionSets, async (permissionSet) => {
            permissionSet.assigneeProfileRefs = await OrgCheckProcessor.map(
                permissionSet.assigneeProfileIds,
                (id) => profiles.get(id),
                (id) => profiles.has(id)
            );
        });

        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(permissionSets, (permissionSet) => {
            if (namespace === '*' || permissionSet.package === namespace) {
                array.push(permissionSet);
            }
        });

        // Return data
        return array;
    }
}