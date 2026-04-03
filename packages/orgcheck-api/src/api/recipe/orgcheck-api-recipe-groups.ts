import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcUser }from 'src/api/data/orgcheck-api-data-user';
import { SfdcGroup }from 'src/api/data/orgcheck-api-data-group';
import { PublicGroupsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-publicgroups';
import { QueuesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-queues';

abstract class AbstractRecipeGroups implements ServedRecipe<SfdcGroup[], Table> {

    /**
     * @description Constructor letting us choose the type of apex classes to check
     * @param title title of this recipe
     * @param filterFunction private function that will filter the groups
     */ 
    constructor(public readonly title: string, private readonly filterFunction: {(g: SfdcGroup): boolean}, ) {}
    
    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.INTERNALACTIVEUSERS, DatasetAliases.PUBLICGROUPSANDQUEUES];
    }

    /**
     * @description List the parameters that this mix dependes on
     * @returns {string[]} List of parameters that this mix dependes on
     * @public
     */
    public mixDependencies(): string[] {
        return [];
    }

    /**
     * @description mix the ingredients all together and return the result
     * @param {Map<string, any>} ingredients - Records or information grouped by their alias in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcGroup[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcGroup[]> {

        // Get data and parameters
        const groups: Map<string, SfdcGroup> = ingredients.get(DatasetAliases.PUBLICGROUPSANDQUEUES);
        const users: Map<string, SfdcUser> = ingredients.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!groups) throw new Error(`RecipePublicGroups: Data from dataset alias 'PUBLICGROUPSANDQUEUES' was undefined.`);
        if (!users) throw new Error(`RecipePublicGroups: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);

        // Augment and filter data
        
        const array: SfdcGroup[] = [];
        await Processor.forEach(groups, async (group: SfdcGroup) => {
            // Augment data
            group.directUserRefs = await Processor.map(
                group.directUserIds,
                (id: string) => users.get(id),
                (id: string) => users.has(id)
            );
            group.directGroupRefs = await Processor.map(
                group.directGroupIds,
                (id: string) => groups.get(id),
                (id: string) => groups.has(id)
            );
            // Filter data
            if (this.filterFunction(group) === true) {
                array.push(group);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcGroup[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public abstract serveToTable(mixture: SfdcGroup[]): Promise<Table>;

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public abstract serveToGo(plate: Table): Promise<ExportedTable | ExportedTable[]>;
}

export class RecipeQueues extends AbstractRecipeGroups {

    /**
     * @description Constructor
     * @public
     */ 
    constructor() {
        super('🦒 Queues', (g: SfdcGroup) => g.isQueue === true);
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcGroup[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcGroup[]): Promise<Table> {
        return TableFactory.create(this.title, new PublicGroupsTableDefinition(), mixture);
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

export class RecipePublicGroups extends AbstractRecipeGroups {

    /**
     * @description Constructor
     * @public
     */ 
    constructor() {
        super('🐘 Public Groups', (g: SfdcGroup) => g.isPublicGroup === true);
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcGroup[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcGroup[]): Promise<Table> {
        return TableFactory.create(this.title, new QueuesTableDefinition(), mixture);
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