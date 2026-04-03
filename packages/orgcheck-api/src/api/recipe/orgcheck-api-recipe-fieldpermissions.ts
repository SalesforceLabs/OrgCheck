import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DataMatrixIntf } from 'src/api/core/data/orgcheck-api-data-matrix';
import { DataMatrixFactory } from 'src/api/core/data/orgcheck-api-data-matrix-factory';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcPermissionSet }from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcProfile }from 'src/api/data/orgcheck-api-data-profile';
import { SfdcFieldPermission }from 'src/api/data/orgcheck-api-data-fieldpermission';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { FieldPermissionsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-fieldpermissions';

export class RecipeFieldPermissions implements ServedRecipe<DataMatrixIntf, Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🚧 Field Level Securities';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation> {
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
     * @description List the parameters that this mix dependes on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [OrgCheckGlobalParameter.PACKAGE_NAME, OrgCheckGlobalParameter.SOBJECT_NAME];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<DataMatrixIntf>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<DataMatrixIntf> {

        // Get data and parameters
        const fieldPermissions: Map<string, SfdcFieldPermission> = ingredients.get(DatasetAliases.FIELDPERMISSIONS);
        const profiles: Map<string, SfdcProfile> = ingredients.get(DatasetAliases.PROFILES);
        const permissionSets: Map<string, SfdcPermissionSet> = ingredients.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!fieldPermissions) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'FIELDPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeFieldPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();

        await Processor.forEach(fieldPermissions, async (fp: SfdcFieldPermission) => {
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

    /**
     * @description Process the mixed data into a table format
     * @param {DataMatrixIntf} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: DataMatrixIntf): Promise<Table> {
        return TableFactory.create(this.title, new FieldPermissionsTableDefinition(mixture), mixture.rows);
    }

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: Table): Promise<ExportedTable> {
        return TableFactory.export(plate);
    }
}