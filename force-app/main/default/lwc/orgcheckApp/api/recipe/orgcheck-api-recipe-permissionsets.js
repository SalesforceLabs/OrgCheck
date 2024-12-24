// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipePermissionSets extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [
            OrgCheckDatasetAliases.PERMISSIONSETS, 
            OrgCheckDatasetAliases.PROFILES
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data, namespace) {
        // Get data
        const permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);
        const profiles = data.get(OrgCheckDatasetAliases.PROFILES);
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