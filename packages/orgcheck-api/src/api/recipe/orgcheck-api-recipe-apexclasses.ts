import { ServedRecipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { ExportedTable, Table } from 'src/ui/table/orgcheck-ui-table';
import { TableFactory } from 'src/ui/table/orgcheck-ui-table-factory';
import { Processor } from 'src/api/core/orgcheck-api-processor';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcApexClass }from 'src/api/data/orgcheck-api-data-apexclass';
import { OrgCheckGlobalParameter } from 'src/api/core/orgcheck-api-globalparameter';
import { ApexClassesTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexclasses';
import { ApexTestsTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apextests';
import { ApexUncompiledTableDefinition } from 'src/ui/table/definitions/orgcheck-ui-tabledef-apexuncompiled';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';

abstract class AbstractRecipeApexClasses implements ServedRecipe<SfdcApexClass[], Table> {

    /**
     * @description Constructor letting us choose the type of apex classes to check
     * @param title title of this recipe
     * @param filterFunction private function that will filter the apex classes
     */ 
    constructor(public readonly title: string, private readonly filterFunction: {(ac: SfdcApexClass): boolean}, ) {}

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.APEXCLASSES
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
     * @returns {Promise<SfdcApexClass[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<SfdcApexClass[]> {

        // Get data and parameters
        const apexClasses: Map<string, SfdcApexClass> = ingredients.get(DatasetAliases.APEXCLASSES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!apexClasses) throw new Error(`RecipeApexClasses: Data from dataset alias 'APEXCLASSES' was undefined.`);

        // Augment and filter data
        const array: SfdcApexClass[] = [];
        await Processor.forEach(apexClasses, async (apexClass: SfdcApexClass) => {            
            // Augment data
            const results = await Promise.all([
                Processor.map(apexClass.relatedTestClassIds, (id: string) => apexClasses.get(id)),
                Processor.map(apexClass.relatedClassIds, (id: string) => apexClasses.get(id))
            ]);
            apexClass.relatedTestClassRefs = results[0];
            apexClass.relatedClassRefs = results[1];
            // Filter data
            if ((namespace === OrgCheckGlobalParameter.ALL_VALUES || apexClass.package === namespace) && this.filterFunction(apexClass)) {
                array.push(apexClass);
            }
        });

        // Return data
        return array;
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcApexClass[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed view
     * @async
     * @public
     */
    public abstract serveToTable(mixture: SfdcApexClass[]): Promise<Table>;

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public abstract serveToGo(plate: Table): Promise<ExportedTable | ExportedTable[]>;
}

export class RecipeApexClasses extends AbstractRecipeApexClasses {

    /**
     * @description Constructor
     * @public
     */ 
    public constructor() {
        super('❤️‍🔥 Apex Classes', (ac: SfdcApexClass) => ac.isTest === false && ac.needsRecompilation === false);
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcApexClass[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed table
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcApexClass[]): Promise<Table> {
        return TableFactory.create(this.title, new ApexClassesTableDefinition(), mixture);
    }

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: Table): Promise<ExportedTable | ExportedTable[]> {
        return TableFactory.export(plate);
    }
}

export class RecipeApexTests extends AbstractRecipeApexClasses {

    /**
     * @description Constructor
     * @public
     */ 
    public constructor() {
        super('🚒 Apex Unit Tests', (ac: SfdcApexClass) => ac.isTest === true && ac.needsRecompilation === false);
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcApexClass[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed table
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcApexClass[]): Promise<Table> {
        return TableFactory.create(this.title, new ApexTestsTableDefinition(), mixture);
    }

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: Table): Promise<ExportedTable | ExportedTable[]> {
        return TableFactory.export(plate);
    }
}

export class RecipeApexUncompiled extends AbstractRecipeApexClasses {

    /**
     * @description Constructor
     * @public
     */ 
    public constructor() {
        super('🌋 Apex Classes That Need Recompilation', (ac: SfdcApexClass) => ac.needsRecompilation === true);
    }

    /**
     * @description Process the mixed data into a table format
     * @param {SfdcApexClass[]} mixture - Mixed data to be served to a table
     * @returns {Promise<Table>} The processed table
     * @async
     * @public
     */
    public async serveToTable(mixture: SfdcApexClass[]): Promise<Table> {
        return TableFactory.create(this.title, new ApexUncompiledTableDefinition(), mixture);
    }

    /**
     * @description We put your plate in a doggy bag
     * @param {Table} plate - Plate which was on the table
     * @returns {Promise<ExportedTable | ExportedTable[]>} Meal in a doggy bag, ready to take back home!
     * @async
     * @public
     */
    public async serveToGo(plate: Table): Promise<ExportedTable | ExportedTable[]> {
        return TableFactory.export(plate);
    }
}