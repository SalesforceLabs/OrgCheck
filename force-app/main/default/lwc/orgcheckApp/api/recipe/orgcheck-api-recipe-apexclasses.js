import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_APEXCLASSES_ALIAS } from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';

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
    async transform(data, namespace) {
        // Get data
        const apexClasses = data.get(DATASET_APEXCLASSES_ALIAS);
        // Augment data
        await OrgCheckProcessor.forEach(apexClasses, async (apexClass) => {
            apexClass.relatedTestClassRefs = await OrgCheckProcessor.map(apexClass.relatedTestClassIds, id => apexClasses.get(id));
            apexClass.relatedClassRefs = await OrgCheckProcessor.map(apexClass.relatedClassIds, id => apexClasses.get(id));
        });
        // Filter data
        const array = [];
        await OrgCheckProcessor.forEach(apexClasses, (apexClass) => {
            if (namespace === '*' || apexClass.package === namespace) {
                array.push(apexClass);
            }
        });
        // Return data
        return array;
    }
}