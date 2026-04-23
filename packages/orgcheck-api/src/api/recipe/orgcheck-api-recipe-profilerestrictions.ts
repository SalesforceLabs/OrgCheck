import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcProfile }from 'src/api/data/orgcheck-api-data-profile';
import { SfdcProfileRestrictions }from 'src/api/data/orgcheck-api-data-profilerestrictions';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { ProfileRestrictionsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-profilerestrictions';

export class RecipeProfileRestrictions implements ServedRecipe<SfdcProfileRestrictions[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🚸 Profile Restrictions';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PROFILES,
            DatasetAliases.PROFILERESTRICTIONS
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
     * @returns {Promise<SfdcProfileRestrictions[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcProfileRestrictions[]> {

        // Get data and parameters
        const profiles: Map<string, SfdcProfile> = ingredients.get(DatasetAliases.PROFILES);
        const profileRestrictions: Map<string, SfdcProfileRestrictions> = ingredients.get(DatasetAliases.PROFILERESTRICTIONS);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!profiles) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILES' was undefined.`);
        if (!profileRestrictions) throw new Error(`RecipeProfileRestrictions: Data from dataset alias 'PROFILERESTRICTIONS' was undefined.`);

        // Augment and Filter data
        const array: SfdcProfileRestrictions[] = [];
        await MediumProcessor.forEach(profileRestrictions, async (restriction: SfdcProfileRestrictions) => {
            // Augment data
            const profileRef = profiles.get(restriction.profileId);
            if (profileRef) {
                restriction.profileRef = profileRef;
            }
            // Filter data
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || restriction.profileRef?.package === namespace) {
                array.push(restriction);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcProfileRestrictions[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcProfileRestrictions[]): Promise<Table> {
        return TableFactory.create(this.title, new ProfileRestrictionsTableDefinition(), mixture);
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