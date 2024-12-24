// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeUserRoles extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [
            OrgCheckDatasetAliases.USERROLES, 
            OrgCheckDatasetAliases.USERS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {boolean} [includesExternalRoles=false] do you want to include the external roles? (false by default)
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data, includesExternalRoles=false) {
        // Get data
        const userRoles = data.get(OrgCheckDatasetAliases.USERROLES);
        const users = data.get(OrgCheckDatasetAliases.USERS);
        // Augment data
        await OrgCheckProcessor.forEach(userRoles, async (userRole) => {
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = await OrgCheckProcessor.map(userRole.activeMemberIds, (id) => users.get(id));
            }
            if (userRole.hasParent === true) {
                userRole.parentRef = userRoles.get(userRole.parentId);
            }
        });

        // Filter data
        const array = [];
        if (includesExternalRoles === true) {
            // in this case do not filter!
            await OrgCheckProcessor.forEach(userRoles, (userRole) => {
                array.push(userRole);
            });
        } else {
            // in this case please filter
            await OrgCheckProcessor.forEach(userRoles, (userRole) => {
                if (userRole.isExternal === false) array.push(userRole);
            });
        }
        // Return data
        return array;
    }
}