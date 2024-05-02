import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_LIGHTNINGAURACOMPONENTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeLightningAuraComponents extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_LIGHTNINGAURACOMPONENTS_ALIAS];
    }

    /**
     * Get a list of Aura Components (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_LightningAuraComponent>}
     */
    transform(data, namespace) {
        // Get data
        const components = data.get(DATASET_LIGHTNINGAURACOMPONENTS_ALIAS);
        // Filter data
        const array = [];
        components.forEach((component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });
        // Return data
        return array;
    }
}