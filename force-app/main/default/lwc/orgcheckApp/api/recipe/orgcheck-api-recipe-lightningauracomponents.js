import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_LIGHTNINGAURACOMPONENTS_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
    async transform(data, namespace) {
        // Get data
        const components = data.get(DATASET_LIGHTNINGAURACOMPONENTS_ALIAS);
        // Filter data
        const array = [];
        await OrgCheckProcessor.chaque(components, (component) => {
            if (namespace === '*' || component.package === namespace) {
                array.push(component);
            }
        });
        // Return data
        return array;
    }
}