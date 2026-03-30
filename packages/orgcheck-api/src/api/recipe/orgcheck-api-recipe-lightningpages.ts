import { ServedRecipe } from 'src/api/core/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcLightningPage }from 'src/api/data/orgcheck-api-data-lightningpage';
import { SfdcObject }from 'src/api/data/orgcheck-api-data-object';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { FlexiPagesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-flexipages';

export class RecipeLightningPages implements ServedRecipe<SfdcLightningPage[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🎂 Lightning Pages';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.LIGHTNINGPAGES,
            DatasetAliases.OBJECTS
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
     * @returns {Promise<SfdcLightningPage[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcLightningPage[]> {

        // Get data and parameters
        const pages: Map<string, SfdcLightningPage> = ingredients.get(DatasetAliases.LIGHTNINGPAGES);
        const objects: Map<string, SfdcObject> = ingredients.get(DatasetAliases.OBJECTS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!pages) throw new Error(`RecipeLightningPages: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!objects) throw new Error(`RecipeLightningPages: Data from dataset alias 'OBJECTS' was undefined.`);

        // Augment and filter data
        
        const array: Array<SfdcLightningPage> = [];
        await Processor.forEach(pages, async (page: SfdcLightningPage) => {
            // Augment data
            if (page.objectId) {
                // if objectId was specified in the page, get the reference of the object
                const objectRef = objects.get(page.objectId);
                if (objectRef) {
                    page.objectRef = objectRef;
                }
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || page.package === namespace) {
                array.push(page);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcLightningPage[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcLightningPage[]): Promise<Table> {
        return TableFactory.create(this.title, new FlexiPagesTableDefinition(), mixture);
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