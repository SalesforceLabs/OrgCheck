import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_APEXTRIGGERS_ALIAS, 
    DATASET_OBJECTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeApexTriggers extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_APEXTRIGGERS_ALIAS,
            DATASET_OBJECTS_ALIAS
        ];
    }

    /**
     * Get a list of apex triggers (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_ApexTrigger>}
     */
    transform(data, namespace) {
        // Get data
        const apexTriggers = data.get(DATASET_APEXTRIGGERS_ALIAS);
        const objects = data.get(DATASET_OBJECTS_ALIAS);
        // Augment data
        apexTriggers.forEach((apexTrigger) => {
            apexTrigger.objectRef = objects.get(apexTrigger.objectId);
        });
        // Filter data
        const array = [];
        apexTriggers.forEach((apexTrigger) => {
            if (namespace === '*' || apexTrigger.package === namespace) {
                array.push(apexTrigger);
            }
        });
        // Return data
        return array;
    }
}