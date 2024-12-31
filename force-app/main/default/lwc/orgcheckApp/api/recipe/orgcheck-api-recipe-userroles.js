import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_UserRole } from '../data/orgcheck-api-data-userrole';
import { SFDC_User } from '../data/orgcheck-api-data-user';

export class OrgCheckRecipeUserRoles extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.USERROLES,
            OrgCheckDatasetAliases.USERS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {boolean} [includesExternalRoles=false] do you want to include the external roles? (false by default)
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, includesExternalRoles=false) {

        // Get data
        const /** @type {Map<string, SFDC_UserRole>} */ userRoles = data.get(OrgCheckDatasetAliases.USERROLES);
        const /** @type {Map<string, SFDC_User>} */ users = data.get(OrgCheckDatasetAliases.USERS);

        // Checking data
        if (!userRoles) throw new Error(`Data from dataset alias 'USERROLES' was undefined.`);
        if (!users) throw new Error(`Data from dataset alias 'USERS' was undefined.`);

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