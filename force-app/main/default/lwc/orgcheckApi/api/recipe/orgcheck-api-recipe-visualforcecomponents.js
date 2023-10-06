import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_VISUALFORCEOMPONENTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeVisualForceComponents extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_VISUALFORCEOMPONENTS_ALIAS];
    }

    /**
     * Get a list of VF Components (async method)
     * 
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_VisualForceComponent>}
     */
    transform(data, namespace) {
        const components = data.get(DATASET_VISUALFORCEOMPONENTS_ALIAS);
        return components.filterValues((component) => {
            if (namespace !== '*' && component.package !== namespace) return false;
            return true;
        });
    }
}