import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcUser }from 'src/api/data/orgcheck-api-data-user';
import { SfdcPermissionSet }from 'src/api/data/orgcheck-api-data-permissionset';
import { SfdcProfile }from 'src/api/data/orgcheck-api-data-profile';
import { UsersTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-users';

export class RecipeInternalActiveUsers implements ServedRecipe<SfdcUser[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '👥 Active Internal Users';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.INTERNALACTIVEUSERS, 
            DatasetAliases.PROFILES, 
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description List the parameters that this mix depends on on
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
     * @returns {Promise<SfdcUser[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcUser[]> {

        // Get data
        const users: Map<string, SfdcUser> = ingredients.get(DatasetAliases.INTERNALACTIVEUSERS);
        const profiles: Map<string, SfdcProfile> = ingredients.get(DatasetAliases.PROFILES);
        const permissionSets: Map<string, SfdcPermissionSet> = ingredients.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!users) throw new Error(`RecipeActiveUsers: Data from dataset alias 'INTERNALACTIVEUSERS' was undefined.`);
        if (!profiles) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PROFILES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipeActiveUsers: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await MediumProcessor.forEach(users, async (user: SfdcUser) => {
            const profileRef = profiles.get(user.profileId);
            if (profileRef) {
                user.profileRef = profileRef;
            }
            user.permissionSetRefs = (await MediumProcessor.map(
                user.permissionSetIds,
                (id: string) => permissionSets.get(id),
                (id: string) => permissionSets.has(id)
            ))?.filter(n => n !== undefined);
            user.importantPermissionsGrantedBy = {
                apiEnabled: [],
                viewSetup: [],
                modifyAllData: [], 
                viewAllData: [],
                manageUsers: [], 
                customizeApplication: []
            };
            if (user.profileRef?.importantPermissions) {
                Object.keys(user.profileRef.importantPermissions)
                    .filter((permName) => user.profileRef.importantPermissions[permName] === true)
                    .forEach((permName) => user.importantPermissionsGrantedBy[permName].push(user.profileRef));
            }
            await MediumProcessor.forEach(user.permissionSetRefs, async (permissionSet: SfdcPermissionSet) => {
                Object.keys(permissionSet.importantPermissions)
                    .filter((permName) => permissionSet.importantPermissions[permName] === true)
                    .forEach((permName) => user.importantPermissionsGrantedBy[permName].push(permissionSet));
            });
            user.importantPermissions = {
                apiEnabled: user.importantPermissionsGrantedBy.apiEnabled?.length > 0,
                viewSetup: user.importantPermissionsGrantedBy.viewSetup?.length > 0,
                modifyAllData: user.importantPermissionsGrantedBy.modifyAllData?.length > 0,
                viewAllData: user.importantPermissionsGrantedBy.viewAllData?.length > 0,
                manageUsers: user.importantPermissionsGrantedBy.manageUsers?.length > 0,
                customizeApplication: user.importantPermissionsGrantedBy.customizeApplication?.length > 0
            };
        });
        // Return data
        return [... users.values()];
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcUser[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcUser[]): Promise<Table> {
        return TableFactory.create(this.title, new UsersTableDefinition(), mixture);
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