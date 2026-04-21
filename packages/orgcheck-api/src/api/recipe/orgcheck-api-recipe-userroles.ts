import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcUserRole }from 'src/api/data/orgcheck-api-data-userrole';
import { SfdcUser }from 'src/api/data/orgcheck-api-data-user';
import { RolesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-roles';

export class RecipeUserRoles implements ServedRecipe<SfdcUserRole[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🦓 Internal Role Listing';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.USERROLES,
            DatasetAliases.INTERNALACTIVEUSERS
        ];
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
     * @returns {Promise<SfdcUserRole[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcUserRole[]> {

        // Get data
        const userRoles: Map<string, SfdcUserRole> = ingredients.get(DatasetAliases.USERROLES);
        const users: Map<string, SfdcUser> = ingredients.get(DatasetAliases.INTERNALACTIVEUSERS);

        // Checking data
        if (!userRoles) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERROLES' was undefined.`);
        if (!users) throw new Error(`RecipeUserRoles: Data from dataset alias 'USERS' was undefined.`);

        // Augment data
        await MediumProcessor.forEach(userRoles, async (userRole: SfdcUserRole) => {
            // Augment data
            if (userRole.hasActiveMembers === true) {
                userRole.activeMemberRefs = (await MediumProcessor.map(userRole.activeMemberIds, (id: string) => users.get(id)))?.filter(n => n !== undefined);
            }
            if (userRole.hasParent === true) {
                const parentRef = userRoles.get(userRole.parentId);
                if (parentRef) {
                    userRole.parentRef = parentRef;
                }
            }
        });

        // Return data
        return [... userRoles.values()];
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcUserRole[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcUserRole[]): Promise<Table> {
        return TableFactory.create(this.title, new RolesTableDefinition(), mixture);
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