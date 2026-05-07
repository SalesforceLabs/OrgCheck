import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcLightningAuraComponent }from 'src/api/data/orgcheck-api-data-lightningauracomponent';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { LightningWebComponentsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-lightningwebcomponents';

export class RecipeLightningAuraComponents implements ServedRecipe<SfdcLightningAuraComponent[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🧁 Lightning Aura Components';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(): Array<string | DatasetRunInformation> {
        return [DatasetAliases.LIGHTNINGAURACOMPONENTS];
    }

    /**
     * @description List the parameters that this mix depends on on
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
     * @returns {Promise<SfdcLightningAuraComponent[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>, _logger: SimpleLoggerIntf, parameters: Map<string, string>): Promise<SfdcLightningAuraComponent[]> {

        // Get data and parameters
        const components = ingredients.get(DatasetAliases.LIGHTNINGAURACOMPONENTS) as Map<string, SfdcLightningAuraComponent>;
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!components) throw new Error(`RecipeLightningAuraComponents: Data from dataset alias 'LIGHTNINGAURACOMPONENTS' was undefined.`);

        // Filter data
        const array: SfdcLightningAuraComponent[] = [];
        await MediumProcessor.forEach(components, async (component: SfdcLightningAuraComponent) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || component.package === namespace) {
                array.push(component);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcLightningAuraComponent[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcLightningAuraComponent[]): Promise<Table> {
        return TableFactory.create(this.title, new LightningWebComponentsTableDefinition(), mixture);
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