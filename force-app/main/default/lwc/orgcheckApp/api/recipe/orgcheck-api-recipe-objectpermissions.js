import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckDataMatrixFactory } from '../core/orgcheck-api-data-matrix-factory';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ObjectPermission } from '../data/orgcheck-api-data-objectpermission';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';

export class OrgCheckRecipeObjectPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.OBJECTPERMISSIONS,
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
        const /** @type {Map<string, SFDC_ObjectPermission>} */ objectPermissions = data.get(OrgCheckDatasetAliases.OBJECTPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!objectPermissions) throw new Error(`Data from dataset alias 'OBJECTPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        const workingMatrix = OrgCheckDataMatrixFactory.create();
        /** @type {Map<string, SFDC_Profile | SFDC_PermissionSet>} */
        const rowHeaderReferences = new Map();
        await OrgCheckProcessor.forEach(objectPermissions, (op) => {
            // Augment data
            if (op.parentId.startsWith('0PS') === true) {
                op.parentRef = permissionSets.get(op.parentId);
            } else {
                op.parentRef = profiles.get(op.parentId);
            }
            // Filter data
            if (namespace === '*' || op.parentRef.package === namespace) {
                workingMatrix.addValueToProperty(
                    op.parentId,
                    op.objectType,
                    (op.isCreate?'C':'')+(op.isRead?'R':'')+(op.isEdit?'U':'')+(op.isDelete?'D':'')+(op.isViewAll?'v':'')+(op.isModifyAll?'m':'')
                );
                rowHeaderReferences.set(op.parentId, op.parentRef);
            }
        });

        // Return data
        return workingMatrix.toDataMatrix(rowHeaderReferences);
    }
}