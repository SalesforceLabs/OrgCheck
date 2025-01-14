import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_ApexTrigger } from '../data/orgcheck-api-data-apextrigger';
import { SFDC_Field } from '../data/orgcheck-api-data-field';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';
import { SFDC_LightningPage } from '../data/orgcheck-api-data-lightningpage';

export class OrgCheckRecipeObject extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @param {string} object Name of the object to describe in this recipe's instance.
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger, object) {
        const datasetRunInfoObject = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.OBJECT, `${OrgCheckDatasetAliases.OBJECT}_${object}`);
        const datasetRunInfoCustomField = new OrgCheckDatasetRunInformation(OrgCheckDatasetAliases.CUSTOMFIELDS, `${OrgCheckDatasetAliases.CUSTOMFIELDS}_${object}`);
        datasetRunInfoObject.parameters.set('object', object);
        datasetRunInfoCustomField.parameters.set('object', object);
        return [ datasetRunInfoObject, 
            OrgCheckDatasetAliases.OBJECTTYPES,
            OrgCheckDatasetAliases.APEXTRIGGERS,
            OrgCheckDatasetAliases.LIGHTNINGPAGES,
            datasetRunInfoCustomField
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const /** @type {SFDC_Object} */ object = data.get(OrgCheckDatasetAliases.OBJECT);
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers = data.get(OrgCheckDatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(OrgCheckDatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Field>} */ customFields = data.get(OrgCheckDatasetAliases.CUSTOMFIELDS);

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
            OrgCheckProcessor.map( // returns apexTriggerRefs
                object.apexTriggerIds,
                (id) => { 
                    const apexTrigger = apexTriggers.get(id);
                    apexTrigger.objectRef = object;
                    return apexTrigger;
                },
                (id) => apexTriggers.has(id)
            ),
            OrgCheckProcessor.forEach(pages, (page) => {
                if (page.objectId === object.id) {
                    object.flexiPages.push(page);
                }
            }),
            OrgCheckProcessor.map( // returns customFieldRefs
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