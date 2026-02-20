import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { DataMatrixFactory } from '../core/orgcheck-api-data-matrix-factory';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ObjectPermission } from '../data/orgcheck-api-data-objectpermission';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeObjectPermissions implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.OBJECTPERMISSIONS,
            DatasetAliases.PROFILES,
            DatasetAliases.PERMISSIONSETS
        ];
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
        const /** @type {Map<string, SFDC_ObjectPermission>} */ objectPermissions: Map<string, SFDC_ObjectPermission> = data.get(DatasetAliases.OBJECTPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles: Map<string, SFDC_Profile> = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets: Map<string, SFDC_PermissionSet> = data.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!objectPermissions) throw new Error(`RecipeObjectPermissions: Data from dataset alias 'OBJECTPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeObjectPermissions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeObjectPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and Filter data
        const workingMatrix = DataMatrixFactory.create();
        /** @type {Map<string, SFDC_Profile | SFDC_PermissionSet>} */
        await Processor.forEach(objectPermissions, async (/** @type {SFDC_ObjectPermission} */ op: SFDC_ObjectPermission) => {
            // Augment data
            const parentRef = (op.parentId.startsWith('0PS') === true ? permissionSets : profiles).get(op.parentId);
            if (parentRef) {
                op.parentRef = parentRef;
            }
            // Stop there if we do not have parent reference
            if (parentRef === undefined) {
                return;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || op.parentRef.package === namespace) {
                if (workingMatrix.hasRowHeader(op.parentId) === false) {
                    workingMatrix.setRowHeader(op.parentId, op.parentRef);
                }
                // Column header: key and value are same so not needed!
                /* if (workingMatrix.hasColumnHeader(op.objectType) === false) {
                    workingMatrix.setColumnHeader(op.objectType, op.objectType);
                } */
                workingMatrix.addValueToProperty(
                    op.parentId,
                    op.objectType,
                    (op.isCreate?'C':'')+(op.isRead?'R':'')+(op.isEdit?'U':'')+(op.isDelete?'D':'')+(op.isViewAll?'v':'')+(op.isModifyAll?'m':'')
                );
            }
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }
}