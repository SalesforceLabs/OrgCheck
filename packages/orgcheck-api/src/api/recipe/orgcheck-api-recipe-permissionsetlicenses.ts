import { Recipe } from '../core/orgcheck-api-recipe';
import { Data } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSetLicense } from '../data/orgcheck-api-data-permissionsetlicense';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { Processor } from '../core/orgcheck-api-processor';

export class RecipePermissionSetLicenses implements Recipe {

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
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SFDC_PermissionSetLicense>} */ permissionSetLicenses: Map<string, SFDC_PermissionSetLicense> = data.get(DatasetAliases.PERMISSIONSETLICENSES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets: Map<string, SFDC_PermissionSet> = data.get(DatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissionSetLicenses) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETLICENSES' was undefined.`);
        if (!permissionSets) throw new Error(`RecipePermissionSetLicenses: Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await Processor.forEach(permissionSetLicenses, async (/** @type {SFDC_PermissionSetLicense} */ permissionSetLicense: SFDC_PermissionSetLicense) => {
            permissionSetLicense.permissionSetRefs = await Processor.map(
                permissionSetLicense.permissionSetIds,
                (/** @type {string} */ id: string) => permissionSets.get(id),
                (/** @type {string} */ id: string) => permissionSets.has(id)
            );
        });

        // Return data
        return [... permissionSetLicenses.values()];
    }
}