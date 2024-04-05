import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECT_ALIAS, 
    DatasetRunInformation, 
    DATASET_OBJECTTYPES_ALIAS } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<DatasetRunInformation>}
     */
    extract(object) {
        const datasetRunInfo = new DatasetRunInformation(DATASET_OBJECT_ALIAS, `${DATASET_OBJECT_ALIAS}_${object}`);
        datasetRunInfo.parameters.set('object', object);
        return [ datasetRunInfo, 
            DATASET_OBJECTTYPES_ALIAS ];
    }

    /**
     * Get the object information (async method)
     * 
     * @param {Map} data extracted
     * 
     * @returns {SFDC_Object}
     */
    transform(data) {
        const types = data.get(DATASET_OBJECTTYPES_ALIAS);
        const object = data.get(DATASET_OBJECT_ALIAS);
        // Augment data
        object.typeRef = types.get(object.typeId);
        // Return data
        return object;
    }
}