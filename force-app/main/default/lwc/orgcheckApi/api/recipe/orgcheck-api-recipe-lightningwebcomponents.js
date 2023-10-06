import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_LIGHTNINGWEBCOMPONENTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeLightningWebComponents extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [DATASET_LIGHTNINGWEBCOMPONENTS_ALIAS];
    }

    /**
     * Get a list of Web Components (async method)
     * 
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_LightningWebComponent>}
     */
    transform(data, namespace) {
        const components = data.get(DATASET_LIGHTNINGWEBCOMPONENTS_ALIAS);
        return components.filterValues((component) => {
            if (namespace !== '*' && component.package !== namespace) return false;
            return true;
        });
    }
}