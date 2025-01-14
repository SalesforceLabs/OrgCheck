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
import { SFDC_Application } from '../data/orgcheck-api-data-application';

export class OrgCheckRecipeAppPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.APPLICATIONS,
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
        const /** @type {Map<string, SFDC_Application>} */ applications = data.get(OrgCheckDatasetAliases.APPLICATIONS);
        const /** @type {Map<string, SFDC_AppPermission>} */ appPermissions = data.get(OrgCheckDatasetAliases.APPPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!applications) throw new Error(`Data from dataset alias 'APPLICATIONS' was undefined.`);
        if (!appPermissions) throw new Error(`Data from dataset alias 'APPPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = OrgCheckDataMatrixFactory.create();
        /** @type {Map<string, SFDC_Profile | SFDC_PermissionSet>} */
        const rowHeaderReferences = new Map();
        /** @type {Map<string, SFDC_Application>} */
        const columnHeaderReferences = new Map();
        await OrgCheckProcessor.forEach(appPermissions, (ap) => {
            // Augment data
            ap.appRef = applications.get(ap.appId);
            if (ap.parentId.startsWith('0PS') === true) {
                ap.parentRef = permissionSets.get(ap.parentId);
            } else {
                ap.parentRef = profiles.get(ap.parentId);
            }
            // Filter data
            if (namespace === '*' || ap.parentRef.package === namespace || ap.appRef.appPackage === namespace ) {
                if (rowHeaderReferences.has(ap.parentId) === false) {
                    rowHeaderReferences.set(ap.parentId, ap.parentRef);
                }
                if (columnHeaderReferences.has(ap.appId) === false) {
                    columnHeaderReferences.set(ap.appId, ap.appRef);
                }
                workingMatrix.addValueToProperty(
                    ap.parentId,
                    ap.appId,
                    (ap.isAccessible?'A':'') + (ap.isVisible?'V':'')
                )
            }
        });

        // Return data
        return workingMatrix.toDataMatrix(rowHeaderReferences, columnHeaderReferences);
    }
}