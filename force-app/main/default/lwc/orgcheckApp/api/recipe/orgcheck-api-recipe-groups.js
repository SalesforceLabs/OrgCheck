// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeGroups extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [OrgCheckDatasetAliases.USERS, OrgCheckDatasetAliases.GROUPS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data) {
        // Get data
        const groups = data.get(OrgCheckDatasetAliases.GROUPS);
        const users = data.get(OrgCheckDatasetAliases.USERS);

        // Augment data
        await OrgCheckProcessor.forEach(groups, async (group) => {
            group.directUserRefs = await OrgCheckProcessor.map(
                group.directUserIds,
                (id) => users.get(id),
                (id) => users.has(id)
            );
            group.directGroupRefs = await OrgCheckProcessor.map(
                group.directGroupIds,
                (id) => groups.get(id),
                (id) => groups.has(id)
            );
        });

        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(groups, async (group) => {
            if (group.isPublicGroup === true || group.isQueue === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }
}