import { Recipe } from 'src/api/core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { DatasetRunInformation } from 'src/api/core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from 'src/api/core/orgcheck-api-datasets-aliases';
import { SfdcPermissionSetLicense }from 'src/api/data/orgcheck-api-data-permissionsetlicense';
import { SfdcPermissionSet }from 'src/api/data/orgcheck-api-data-permissionset';
import { Processor } from 'src/api/core/orgcheck-api-processor';

export class RecipePermissionSetLicenses implements Recipe<SfdcPermissionSetLicense[]> {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [
            DatasetAliases.PERMISSIONSETLICENSES,
            DatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<SfdcPermissionSetLicense[]>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<SfdcPermissionSetLicense[]> {

        // Get data
        const permissionSetLicenses: Map<string, SfdcPermissionSetLicense> = data.get(DatasetAliases.PERMISSIONSETLICENSES);
        const permissionSets: Map<string, SfdcPermissionSet> = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissionSetLicenses) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETLICENSES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(permissionSetLicenses, async (permissionSetLicense: SfdcPermissionSetLicense) => {
            permissionSetLicense.permissionSetRefs = await Processor.map(
                permissionSetLicense.permissionSetIds,
                (id: string) => permissionSets.get(id),
                (id: string) => permissionSets.has(id)
            );
        });

        // Return data
        return [... permissionSetLicenses.values()];
    }
}