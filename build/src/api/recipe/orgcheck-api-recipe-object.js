import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processing';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';

export class RecipeObject extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger, object) {
        const datasetRunInfoObject = new DatasetRunInformation(DatasetAliases.OBJECT, `${DatasetAliases.OBJECT}_${object}`);
        const datasetRunInfoCustomField = new DatasetRunInformation(DatasetAliases.CUSTOMFIELDS, `${DatasetAliases.CUSTOMFIELDS}_${object}`);
        datasetRunInfoObject.parameters.set('object', object);
        datasetRunInfoCustomField.parameters.set('object', object);
        return [ datasetRunInfoObject, 
            DatasetAliases.OBJECTTYPES,
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.LIGHTNINGPAGES,
            datasetRunInfoCustomField
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {SFDC_Object} */ object = data.get(DatasetAliases.OBJECT);
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers = data.get(DatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(DatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Field>} */ customFields = data.get(DatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!object) throw new Error(`Data from dataset alias 'OBJECT' was undefined.`);
        if (!apexTriggers) throw new Error(`Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!pages) throw new Error(`Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!customFields) throw new Error(`Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment data
        object.typeRef = types.get(object.typeId);
        object.flexiPages = [];
        const result = await Promise.all([
            Processor.map( // returns apexTriggerRefs
                object.apexTriggerIds,
                (id) => { 
                    const apexTrigger = apexTriggers.get(id);
                    apexTrigger.objectRef = object;
                    return apexTrigger;
                },
                (id) => apexTriggers.has(id)
            ),
            Processor.forEach(pages, (page) => {
                if (page.objectId === object.id) {
                    object.flexiPages.push(page);
                }
            }),
            Processor.map( // returns customFieldRefs
                object.customFieldIds,
                (id) => { 
                    const customField = customFields.get(id);
                    customField.objectRef = object;
                    return customField;
                },
                (id) => customFields.has(id)
            )
        ]);
        object.apexTriggerRefs = result[0];
        object.customFieldRefs = result[2];

        // Return data
        return object;
    }
}