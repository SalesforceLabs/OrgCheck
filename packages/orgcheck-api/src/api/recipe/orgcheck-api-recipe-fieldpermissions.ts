import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { DataMatrixFactory } from '../core/orgcheck-api-data-matrix-factory';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { SFDC_Profile } from '../data/orgcheck-api-data-profile';
import { SFDC_FieldPermission } from '../data/orgcheck-api-data-fieldpermission';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeFieldPermissions implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation> {
        return [
            new DatasetRunInformation(
                DatasetAliases.FIELDPERMISSIONS,
                `${DatasetAliases.FIELDPERMISSIONS}_${OrgCheckGlobalParameter.getSObjectName(parameters)}`,
                parameters // should contain 'object'
            ),
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
        const /** @type {Map<string, SFDC_FieldPermission>} */ fieldPermissions: Map<string, SFDC_FieldPermission> = data.get(DatasetAliases.FIELDPERMISSIONS);
        const /** @type {Map<string, SFDC_Profile>} */ profiles: Map<string, SFDC_Profile> = data.get(DatasetAliases.PROFILES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets: Map<string, SFDC_PermissionSet> = data.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!fieldPermissions) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'FIELDPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();

        await Processor.forEach(fieldPermissions, async (/** @type {SFDC_FieldPermission} */ fp: SFDC_FieldPermission) => {
            // Augment data
            const parentRef = (fp.parentId.startsWith('0PS') === true ? permissionSets : profiles).get(fp.parentId);
            if (parentRef) {
                fp.parentRef = parentRef;
            }
            // Stop there if we do not have parent reference
            if (parentRef === undefined) {
                return;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || fp.parentRef.package === namespace ) {
                if (workingMatrix.hasRowHeader(fp.parentId) === false) {
                    workingMatrix.setRowHeader(fp.parentId, fp.parentRef);
                }
                // Column header: key and value are same so not needed!
                /* if (workingMatrix.hasColumnHeader(fp.fieldApiName) === false) {
                    workingMatrix.setColumnHeader(fp.fieldApiName, fp.fieldApiName);
                }*/
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