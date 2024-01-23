import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_WORKFLOWS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeWorkflows extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_WORKFLOWS_ALIAS];
    }

    /**
     * Get a list of workflows (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_Workflow>}
     */
    transform(data) {
        // Get data
        const workflows = data.get(DATASET_WORKFLOWS_ALIAS);
        // Return data
        return [... workflows.values()];
    }
}