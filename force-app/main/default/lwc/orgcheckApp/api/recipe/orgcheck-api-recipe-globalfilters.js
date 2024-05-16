import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_PACKAGES_ALIAS, 
    DATASET_OBJECTTYPES_ALIAS, 
    DATASET_OBJECTS_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipePackagesTypesAndObjects extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<string>}
     */
    extract() {
        return [
            DATASET_PACKAGES_ALIAS, 
            DATASET_OBJECTTYPES_ALIAS, 
            DATASET_OBJECTS_ALIAS
        ];
    }

    /**
     * Get a list of packages, types and objects (async method)
     * 
     * @param {Map} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Any}
     */
    transform(data, namespace, type) {
        // Get data
        const packages = data.get(DATASET_PACKAGES_ALIAS);
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const objects = data.get(DATASET_OBJECTS_ALIAS);
        // Augment data
        objects.forEach((object) => {
            object.typeRef = types.get(object.typeId);
        });
        // Filter data
        const array = [];
        objects.forEach((object) => {
            if ((namespace === '*' || object.package === namespace) &&
                (type === '*' || object.typeRef?.id === type)) {
                array.push(object);
            }
        });
        // Return data
        return { 
            packages: [... packages.values()],
            types: [... types.values()],
            objects: array
        };
    }
}