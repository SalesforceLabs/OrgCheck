import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_FLOWS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeProcessBuilders extends OrgCheckRecipe {

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
    transform(data) {
        // Get data
        const flows = data.get(DATASET_FLOWS_ALIAS);
        // Filter data
        const array = [];
        flows.forEach((flow) => {
            if (flow.type === 'Workflow') {
                array.push(flow);
            }
        });
        // Return data
        return array;
    }
}