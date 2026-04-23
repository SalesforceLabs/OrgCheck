import { Recipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';

export class RecipeCurrentUserPermissions implements Recipe<Map<string, boolean>> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = 'Current User Permissions';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation> {
        return [
            new DatasetRunInformation(
                DatasetAliases.CURRENTUSERPERMISSIONS,
                DatasetAliases.CURRENTUSERPERMISSIONS,
                parameters // should include 'permissions'
            )
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
     * @returns {Promise<Map<string, boolean>>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Map<string, boolean>> {

        // Get data
        const currentUserPermissions: Map<string, boolean> = ingredients.get(DatasetAliases.CURRENTUSERPERMISSIONS);
        
        // Checking data
        if (!currentUserPermissions) throw new Error(`RecipeCurrentUserPermissions: Data from dataset alias 'CURRENTUSERPERMISSIONS' was undefined.`);

        // Return all data
        return currentUserPermissions;
    }
}