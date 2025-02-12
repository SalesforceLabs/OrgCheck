import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { DataMatrixFactory } from '../core/orgcheck-api-data-matrix-factory';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_FieldPermission } from '../data/orgcheck-api-data-fieldpermission';

export class RecipeFieldPermissions extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, object) {
        const datasetRunInfoFieldPerms = new DatasetRunInformation(DatasetAliases.FIELDPERMISSIONS, `${DatasetAliases.FIELDPERMISSIONS}_${object}`);
        datasetRunInfoFieldPerms.parameters.set('object', object);
        return [
            datasetRunInfoFieldPerms,
            DatasetAliases.PROFILES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @param {string} namespace Name of the package (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, object, namespace) {

        // Get data
        const /** @type {Map<string, SFDC_FieldPermission>} */ fieldPermissions = data.get(DatasetAliases.FIELDPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!fieldPermissions) throw new Error(`Data from dataset alias 'FIELDPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();

        await Processor.forEach(fieldPermissions, (/** @type {SFDC_FieldPermission} */ fp) => {
            // Augment data
            if (fp.parentId.startsWith('0PS') === true) {
                fp.parentRef = permissionSets.get(fp.parentId);
            } else {
                fp.parentRef = profiles.get(fp.parentId);
            }
            // Filter data
            if (namespace === '*' || fp.parentRef.package === namespace ) {
                if (workingMatrix.hasRowHeader(fp.parentId) === false) {
                    workingMatrix.setRowHeader(fp.parentId, fp.parentRef);
                }
                if (workingMatrix.hasColumnHeader(fp.fieldApiName) === false) {
                    workingMatrix.setColumnHeader(fp.fieldApiName, fp.fieldApiName);
                }
                workingMatrix.addValueToProperty(
                    fp.parentId,
                    fp.fieldApiName,
                    (fp.isRead?'R':'') + (fp.isEdit?'U':'')
                )
            }
        });

        // Return data
        return workingMatrix.toDataMatrix();
    }
}