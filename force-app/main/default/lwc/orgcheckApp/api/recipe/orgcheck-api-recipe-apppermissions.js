// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation} from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeAppPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract() {
        return [
            OrgCheckDatasetAliases.APPPERMISSIONS,
            OrgCheckDatasetAliases.PROFILES,
            OrgCheckDatasetAliases.PERMISSIONSETS
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
        const permissions = data.get(OrgCheckDatasetAliases.APPPERMISSIONS);
        const profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);

        // Augment data
        await OrgCheckProcessor.forEach(permissions, (permission) => {
            if (permission.isParentProfile === true) {
                permission.parentRef = profiles.get(permission.parentId);
            } else {
                permission.parentRef = permissionSets.get(permission.parentId);
            }
        });

        // Filter data
        const matrix = new OrgCheckMatrixData();
        await OrgCheckProcessor.forEach(permissions, (permission) => {
            if (namespace === '*' || permission.parentRef.package === namespace) {
                matrix.addValueToProperty(
                    permission.parentId,
                    permission.parentName,
                    permission.appName,
                    (permission.isAccessible?'A':'') + (permission.isVisible?'V':'')
                )
            }
        });

        // Return data
        return matrix;
    }
}