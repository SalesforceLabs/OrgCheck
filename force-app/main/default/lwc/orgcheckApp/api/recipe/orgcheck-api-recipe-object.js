// @ts-check

import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckDatasetAliases, OrgCheckDatasetRunInformation} from '../core/orgcheck-api-datasetmanager';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData } from '../core/orgcheck-api-data';
import { OrgCheckMatrixData } from '../core/orgcheck-api-data-matrix';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(object) {
        const datasetRunInfoObject = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.OBJECT, `${OrgCheckDatasetAliases.OBJECT}_${object}`);
        const datasetRunInfoCustomField = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.CUSTOMFIELDS, `${OrgCheckDatasetAliases.CUSTOMFIELDS}_${object}`);
        datasetRunInfoObject.parameters.set('object', object);
        datasetRunInfoCustomField.parameters.set('object', object);
        return [ datasetRunInfoObject, 
            OrgCheckDatasetAliases.OBJECTTYPES,
            OrgCheckDatasetAliases.APEXTRIGGERS,
            datasetRunInfoCustomField
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @returns {Promise<Array<OrgCheckData> | OrgCheckMatrixData | OrgCheckData | Map>}
     * @async
     * @public
     */
    async transform(data) {
        const types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const object = data.get(OrgCheckDatasetAliases.OBJECT);
        const apexTriggers = data.get(OrgCheckDatasetAliases.APEXTRIGGERS);
        const customFields = data.get(OrgCheckDatasetAliases.CUSTOMFIELDS);
        // Augment data
        object.typeRef = types.get(object.typeId);
        object.apexTriggerRefs = await OrgCheckProcessor.map(
            object.apexTriggerIds,
            (id) => { 
                const apexTrigger = apexTriggers.get(id);
                apexTrigger.objectRef = object;
                return apexTrigger;
            },
            (id) => apexTriggers.has(id)
        );
        object.customFieldRefs = await OrgCheckProcessor.map(
            object.customFieldIds,
            (id) => { 
                const customField = customFields.get(id);
                customField.objectRef = object;
                return customField;
            },
            (id) => customFields.has(id)
        );
        // Return data
        return object;
    }
}