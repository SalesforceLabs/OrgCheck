import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { SfdcApexTrigger }from 'src/api/data/orgcheck-api-data-apextrigger';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { ApexTriggersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextriggers';

export class RecipeApexTriggers implements ServedRecipe<SfdcApexTrigger[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🧨 Apex Triggers';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.OBJECTS
        ];
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
     * @returns {Promise<SfdcApexTrigger[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>, _logger: SimpleLoggerIntf, parameters: Map<string, string>): Promise<SfdcApexTrigger[]> {

        // Get data and parameters
        const apexTriggers = ingredients.get(DatasetAliases.APEXTRIGGERS) as Map<string, SfdcApexTrigger>;
        const objects = ingredients.get(DatasetAliases.OBJECTS) as Map<string, SfdcObject>;
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!apexTriggers) throw new Error(`RecipeApexTriggers: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!objects) throw new Error(`RecipeApexTriggers: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        const array: SfdcApexTrigger[] = [];
        await MediumProcessor.forEach(apexTriggers, async (apexTrigger: SfdcApexTrigger) => {
            // Augment data
            const objectRef = objects.get(apexTrigger.objectId);
            if (objectRef) {
                apexTrigger.objectRef = objectRef;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || apexTrigger.package === namespace) {
                array.push(apexTrigger);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcApexTrigger[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcApexTrigger[]): Promise<Table> {
        return TableFactory.create(this.title, new ApexTriggersTableDefinition(), mixture);
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