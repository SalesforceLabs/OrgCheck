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
import { SFDC_FieldPermission } from '../data/orgcheck-api-data-fieldpermission';

export class OrgCheckRecipeFieldPermissions extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger, object) {
        const datasetRunInfoFieldPerms = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.FIELDPERMISSIONS, `${OrgCheckDatasetAliases.FIELDPERMISSIONS}_${object}`);
        datasetRunInfoFieldPerms.parameters.set('object', object);
        return [
            datasetRunInfoFieldPerms,
            OrgCheckDatasetAliases.PROFILES,
            OrgCheckDatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, object, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_FieldPermission>} */ fieldPermissions = data.get(OrgCheckDatasetAliases.FIELDPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(OrgCheckDatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!fieldPermissions) throw new Error(`Data from dataset alias 'FIELDPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = OrgCheckDataMatrixFactory.create();
        /** @type {Map<string, SFDC_Profile | SFDC_PermissionSet>} */
        const rowHeaderReferences = new Map();
        /** @type {Map<string, string>} */
        const columnHeaderReferences = new Map();
        await OrgCheckProcessor.forEach(fieldPermissions, (/** @type {SFDC_FieldPermission} */ fp) => {
            // Augment data
            if (fp.parentId.startsWith('0PS') === true) {
                fp.parentRef = permissionSets.get(fp.parentId);
            } else {
                fp.parentRef = profiles.get(fp.parentId);
            }
            // Filter data
            if (namespace === '*' || fp.parentRef.package === namespace ) {
                if (rowHeaderReferences.has(fp.parentId) === false) {
                    rowHeaderReferences.set(fp.parentId, fp.parentRef);
                }
                if (columnHeaderReferences.has(fp.fieldApiName) === false) {
                    columnHeaderReferences.set(fp.fieldApiName, fp.fieldApiName);
                }
                workingMatrix.addValueToProperty(
                    fp.parentId,
                    fp.fieldApiName,
                    (fp.isRead?'R':'') + (fp.isEdit?'U':'')
                )
            }
        });

        // Return data
        return workingMatrix.toDataMatrix(rowHeaderReferences, columnHeaderReferences);
    }
}