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
     * @param {OrgCheckMap} data extracted
     * @param {string} namespace you want to list (optional), '*' for any
     * 
     * @returns {Any}
     */
    transform(data, namespace, type) {
        const packages = data.get(DATASET_PACKAGES_ALIAS);
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const objects = data.get(DATASET_OBJECTS_ALIAS);
        objects.forEachValue((object) => {
            object.typeRef = types.get(object.typeId);
        });
        return { 
            packages: packages.allValues(),
            types: types.allValues(),
            objects: objects.filterValues((object) => {
                if (namespace !== '*' && object.package !== namespace) return false;
                if (type !== '*' && object.typeRef?.id !== type) return false;
                return true;
            })
        };
    }
}