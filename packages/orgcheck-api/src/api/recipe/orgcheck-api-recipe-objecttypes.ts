import { Recipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcObjectType }from 'src/api/data/orgcheck-api-data-objecttype';

export class RecipeObjectTypes implements Recipe<SfdcObjectType[]> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = 'Object Types';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [ DatasetAliases.OBJECTTYPES ];
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
     * @returns {Promise<SfdcObjectType[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcObjectType[]> {

        // Get data
        const types: Map<string, SfdcObjectType> = ingredients.get(DatasetAliases.OBJECTTYPES);

        // Checking data
        if (!types) throw new Error(`RecipeObjectTypes: Data from dataset alias 'OBJECTTYPES' was undefined.`);

        // Return data
        return [... types.values()];
    }
}