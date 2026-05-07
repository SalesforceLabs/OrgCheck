import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcEmailTemplate }from 'src/api/data/orgcheck-api-data-emailtemplate';
import { MediumProcessor } from 'src/api/core/orgcheck-api-processor';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { EmailTemplatesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-emailtemplates';

export class RecipeEmailTemplates implements ServedRecipe<SfdcEmailTemplate[], Table> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = '🌇 Email Templates';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(): Array<string | DatasetRunInformation> {
        return [DatasetAliases.EMAILTEMPLATES];
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
     * @returns {Promise<SfdcEmailTemplate[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, unknown>, _logger: SimpleLoggerIntf, parameters: Map<string, string>): Promise<SfdcEmailTemplate[]> {

        // Get data and parameters
        const emailTemplates = ingredients.get(DatasetAliases.EMAILTEMPLATES) as Map<string, SfdcEmailTemplate>;
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!emailTemplates) throw new Error(`RecipeDocuments: Data from dataset alias 'EMAILTEMPLATES' was undefined.`);

        // Filter data
        const array: SfdcEmailTemplate[] = [];
        await MediumProcessor.forEach(emailTemplates, async (emailTemplate: SfdcEmailTemplate) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || emailTemplate.package === namespace) {
                array.push(emailTemplate);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcEmailTemplate[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcEmailTemplate[]): Promise<Table> {
        return TableFactory.create(this.title, new EmailTemplatesTableDefinition(), mixture);
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