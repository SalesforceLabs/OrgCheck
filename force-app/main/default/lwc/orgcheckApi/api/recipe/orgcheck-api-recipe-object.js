import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { DATASET_OBJECT_ALIAS, DatasetRunInformation } from '../core/orgcheck-api-datasetmanager';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /** 
     * Return the list of dataset you need 
     * 
     * @returns {Array<DatasetRunInformation>}
     */
    extract(object) {
        const datasetRunInfo = new DatasetRunInformation();
        datasetRunInfo.alias = DATASET_OBJECT_ALIAS;
        datasetRunInfo.cacheKey = `${DATASET_OBJECT_ALIAS}_${object}`;
        datasetRunInfo.parameters = { object: object };
        return [ datasetRunInfo ];
    }

    /**
     * Get the object information (async method)
     * 
     * @param {OrgCheckMap} data extracted
     * 
     * @returns {SFDC_Object}
     */
    transform(data) {
        return data.get(DATASET_OBJECT_ALIAS);
    }
}