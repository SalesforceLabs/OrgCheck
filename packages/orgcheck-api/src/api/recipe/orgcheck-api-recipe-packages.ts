import { Recipe } from 'src/api/core/recipe/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/logger/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/dataset/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/dataset/orgcheck-api-datasets-aliases';
import { SfdcPackage }from 'src/api/data/orgcheck-api-data-package';

export class RecipePackages implements Recipe<SfdcPackage[]> {

    /**
     * @description Title of this recipe
     * @type {string}
     * @public
     */
    public readonly title: string = 'Packages';

    /**
     * @description List all ingredients (aka dataset aliases or datasetRunInfos) that Org Check will use in this recipe
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The ingredients to use in this recipe
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [ DatasetAliases.PACKAGES ];
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
     * @returns {Promise<SfdcPackage[]>} Returns the mixture
     * @async
     * @public
     */
    public async mix(ingredients: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcPackage[]> {

        // Get data
        const packages: Map<string, SfdcPackage> = ingredients.get(DatasetAliases.PACKAGES);

        // Checking data
        if (!packages) throw new Error(`RecipePackages: Data from dataset alias 'PACKAGES' was undefined.`);

        // Return data
        return [... packages.values()];
    }
}