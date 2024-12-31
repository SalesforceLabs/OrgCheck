import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_Flow } from '../data/orgcheck-api-data-flow';

export class OrgCheckRecipeFlows extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [OrgCheckDatasetAliases.FLOWS];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_Flow>} */ flows = data.get(OrgCheckDatasetAliases.FLOWS);

        // Checking data
        if (!flows) throw new Error(`Data from dataset alias 'FLOWS' was undefined.`);

        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(flows, (flow) => {
            if (flow.type !== 'Workflow') {
                array.push(flow);
            }
        });

        // Return data
        return array;
    }
}