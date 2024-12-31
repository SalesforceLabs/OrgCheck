import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckDataMatrixFactory } from '../core/orgcheck-api-data-matrix-factory';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';

export class OrgCheckRecipeAppPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.APPPERMISSIONS,
            OrgCheckDatasetAliases.PROFILES,
            OrgCheckDatasetAliases.PERMISSIONSETS
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
        const /** @type {Map<string, SFDC_AppPermission>} */ permissions = data.get(OrgCheckDatasetAliases.APPPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissions) throw new Error(`Data from dataset alias 'APPPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Filter data
        const workingMatrix = OrgCheckDataMatrixFactory.create();
        /** @type {Map<string, SFDC_Profile | SFDC_PermissionSet>()} */
        const profilesAndPermSets = new Map();
        await OrgCheckProcessor.forEach(permissions, (permission) => {
            if (namespace === '*' || permission.parentRef.package === namespace || permission.appPackage === namespace ) {
                if (profilesAndPermSets.has(permission.parentId) === false) {
                    if (permission.isParentProfile === true) {
                        profilesAndPermSets.set(permission.parentId, profiles.get(permission.parentId));
                    } else {
                        profilesAndPermSets.set(permission.parentId, permissionSets.get(permission.parentId));
                    }
                }
                workingMatrix.addValueToProperty(
                    permission.parentId,
                    permission.appName,
                    (permission.isAccessible?'A':'') + (permission.isVisible?'V':'')
                )
            }
        });

        // Return data
        return workingMatrix.toDataMatrix(profilesAndPermSets);
    }
}