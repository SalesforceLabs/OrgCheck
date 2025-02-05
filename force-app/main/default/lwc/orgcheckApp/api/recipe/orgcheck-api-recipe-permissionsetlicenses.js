import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_PermissionSetLicense } from '../data/orgcheck-api-data-permissionsetlicense';
import { SFDC_PermissionSet } from '../data/orgcheck-api-data-permissionset';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipePermissionSetLicenses extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.PERMISSIONSETLICENSES,
            OrgCheckDatasetAliases.PERMISSIONSETS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_PermissionSetLicense>} */ permissionSetLicenses = data.get(OrgCheckDatasetAliases.PERMISSIONSETLICENSES);
        const /** @type {Map<string, SFDC_PermissionSet>} */ permissionSets = data.get(OrgCheckDatasetAliases.PERMISSIONSETS);

        // Checking data
        if (!permissionSetLicenses) throw new Error(`Data from dataset alias 'PERMISSIONSETLICENSES' was undefined.`);
        if (!permissionSets) throw new Error(`Data from dataset alias 'PERMISSIONSETS' was undefined.`);

        // Augment data
        await OrgCheckProcessor.forEach(permissionSetLicenses, async (permissionSetLicense) => {
            permissionSetLicense.permissionSetRefs = await OrgCheckProcessor.map(
                permissionSetLicense.permissionSetIds,
                (/** @type {string} */ id) => permissionSets.get(id),
                (/** @type {string} */ id) => permissionSets.has(id)
            );
        });

        // Return data
        return [... permissionSetLicenses.values()];
    }
}