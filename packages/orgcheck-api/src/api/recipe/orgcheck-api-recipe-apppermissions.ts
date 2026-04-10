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
import { SfdcAppPermission }from 'src/api/data/orgcheck-api-data-apppermission';
import { SfdcApplication }from 'src/api/data/orgcheck-api-data-application';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { AppPermissionsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apppermissions';

export class RecipeAppPermissions implements ServedRecipe<DataMatrixIntf, Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '⛕ Application Permissions'

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.APPLICATIONS,
            DatasetAliases.APPPERMISSIONS,
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
        return [OrgCheckGlobalParameter.PACKAGE_NAME];
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
        const applications: Map<string, SfdcApplication> = ingredients.get(DatasetAliases.APPLICATIONS);
        const appPermissions: Map<string, SfdcAppPermission> = ingredients.get(DatasetAliases.APPPERMISSIONS);
        const profiles: Map<string, SfdcProfile> = ingredients.get(DatasetAliases.PROFILES);
        const permissionSets: Map<string, SfdcPermissionSet> = ingredients.get(DatasetAliases.PERMISSIONSETS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!applications) throw new Error(`RecipeAppPermissions: Data from dataset alias 'APPLICATIONS' was undefined.`);
        if (!appPermissions) throw new Error(`RecipeAppPermissions: Data from dataset alias 'APPPERMISSIONS' was undefined.`);
        if (!profiles) throw new Error(`RecipeAppPermissions :Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeAppPermissions: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment and filter data
        const workingMatrix = DataMatrixFactory.create();
        await Processor.forEach(appPermissions, async (ap: SfdcAppPermission) => {
            // Augment data
            const applicationRef = applications.get(ap.appId);
            if (applicationRef) {
                ap.appRef = applicationRef;
            }
            const parentRef = (ap.parentId.startsWith('0PS') === true ? permissionSets : profiles).get(ap.parentId);
            if (parentRef) {
                ap.parentRef = parentRef;
            }
            // Stop there if we do not have both application and parent references
            if (applicationRef === undefined || parentRef === undefined) {
                return;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || ap.parentRef?.package === namespace || ap.appRef?.package === namespace ) {
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

    /**
     * @description Process the mixed data into a table format
     * @param {DataMatrixIntf} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: DataMatrixIntf): Promise<Table> {
        return TableFactory.create(this.title, new AppPermissionsTableDefinition(mixture), mixture.rows);
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