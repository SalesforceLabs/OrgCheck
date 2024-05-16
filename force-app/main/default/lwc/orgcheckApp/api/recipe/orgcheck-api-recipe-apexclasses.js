import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_APEXCLASSES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeApexClasses extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_APEXCLASSES_ALIAS
        ];
    }

    /**
     * Get a list of apex classes (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Array<SFDC_ApexClass>}
     */
    transform(data, namespace) {
        // Get data
        const apexClasses = data.get(DATASET_APEXCLASSES_ALIAS);
        // Augment data
        apexClasses.forEach((apexClass) => {
            if (apexClass.relatedTestClassIds) apexClass.relatedTestClassRefs = apexClass.relatedTestClassIds.map(id => apexClasses.get(id));
            if (apexClass.relatedClassIds) apexClass.relatedClassRefs = apexClass.relatedClassIds.map(id => apexClasses.get(id));
        });
        // Filter data
        const array = [];
        apexClasses.forEach((apexClass) => {
            if (namespace === '*' || apexClass.package === namespace) {
                array.push(apexClass);
            }
        });
        // Return data
        return array;
    }
}