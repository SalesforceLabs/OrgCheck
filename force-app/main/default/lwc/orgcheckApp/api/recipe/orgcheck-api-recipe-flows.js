import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_FLOWS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

export class OrgCheckRecipeFlows extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_FLOWS_ALIAS];
    }

    /**
     * Get a list of process builders (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {Array<SFDC_Flow>}
     */
    async transform(data) {
        // Get data
        const flows = data.get(DATASET_FLOWS_ALIAS);
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