import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { DataMatrixFactory } from '../core/orgcheck-api-data-matrix-factory';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_AppPermission } from '../data/orgcheck-api-data-apppermission';
import { SFDC_Application } from '../data/orgcheck-api-data-application';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeAppPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger) {
        return [
            DatasetAliases.APPLICATIONS,
            DatasetAliases.APPPERMISSIONS,
            DatasetAliases.PROFILES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger, parameters) {

        // Get data and parameters
        const /** @type {Map<string, SFDC_Application>} */ applications = data.get(DatasetAliases.APPLICATIONS);
        const /** @type {Map<string, SFDC_AppPermission>} */ appPermissions = data.get(DatasetAliases.APPPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!applications) throw new Error(`RecipeAppPermissions: Data from dataset alias 'APPLICATIONS' was undefined.`);
        if (!appPermissions) throw new Error(`RecipeAppPermissions: Data from dataset alias 'APPPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeAppPermissions :Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeAppPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();
        await Processor.forEach(appPermissions, (/** @type {SFDC_AppPermission} */ ap) => {
            // Augment data
            ap.appRef = applications.get(ap.appId);
            if (ap.parentId.startsWith('0PS') === true) {
                ap.parentRef = permissionSets.get(ap.parentId);
            } else {
                ap.parentRef = profiles.get(ap.parentId);
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || ap.parentRef.package === namespace || ap.appRef.package === namespace ) {
                if (workingMatrix.hasRowHeader(ap.parentId) === false) {
                    workingMatrix.setRowHeader(ap.parentId, ap.parentRef);
                }
                if (workingMatrix.hasColumnHeader(ap.appId) === false) {
                    workingMatrix.setColumnHeader(ap.appId, ap.appRef);
                }
                workingMatrix.addValueToProperty(
                    ap.parentId,
                    ap.appId,
                    (ap.isAccessible?'A':'') + (ap.isVisible?'V':'')
                )
            }
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }
}