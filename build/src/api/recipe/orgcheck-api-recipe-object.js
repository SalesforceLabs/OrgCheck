import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
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
import { SFDC_Workflow } from '../data/orgcheck-api-data-workflow';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeObject extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger, parameters) {
        return [ 
            new DatasetRunInformation(
                DatasetAliases.OBJECT,
                `${DatasetAliases.OBJECT}_${OrgCheckGlobalParameter.getSObjectName(parameters)}`,
                parameters // should include 'object'
            ),
            DatasetAliases.OBJECTTYPES,
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.WORKFLOWS,
            DatasetAliases.LIGHTNINGPAGES,
            new DatasetRunInformation(
                DatasetAliases.CUSTOMFIELDS,
                `${DatasetAliases.CUSTOMFIELDS}_${OrgCheckGlobalParameter.getSObjectName(parameters)}`,
                parameters // should include 'object'
            ),
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as an Array
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data, _logger) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {SFDC_Object} */ object = data.get(DatasetAliases.OBJECT);
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers = data.get(DatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_Workflow>} */ workflowRules = data.get(DatasetAliases.WORKFLOWS);
        const /** @type {Map<string, SFDC_LightningPage>} */ pages = data.get(DatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Field>} */ customFields = data.get(DatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`RecipeObject: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!object) throw new Error(`RecipeObject: Data from dataset alias 'OBJECT' was undefined.`);
        if (!apexTriggers) throw new Error(`RecipeObject: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!workflowRules) throw new Error(`RecipeObject: Data from dataset alias 'WORKFLOWS' was undefined.`);
        if (!pages) throw new Error(`RecipeObject: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!customFields) throw new Error(`RecipeObject: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment data
        object.typeRef = types.get(object.typeId);
        object.flexiPages = [];
        const result = await Promise.all([
            Processor.map( // returns apexTriggerRefs
                object.apexTriggerIds,
                (/** @type {string} */ id) => { 
                    const apexTrigger = apexTriggers.get(id);
                    apexTrigger.objectRef = object;
                    return apexTrigger;
                },
                (/** @type {string} */ id) => apexTriggers.has(id)
            ),
            Processor.map( // returns workflowRuleRefs
                object.workflowRuleIds,
                (/** @type {string} */ id) => workflowRules.get(id),
                (/** @type {string} */ id) => workflowRules.has(id)
            ),
            Processor.forEach(pages, (/** @type {SFDC_LightningPage} */ page) => {
                if (page.objectId === object.id) {
                    object.flexiPages.push(page);
                }
            }),
            Processor.map( // returns customFieldRefs
                object.customFieldIds,
                (/** @type {string} */ id) => { 
                    const customField = customFields.get(id);
                    customField.objectRef = object;
                    return customField;
                },
                (/** @type {string} */ id) => customFields.has(id)
            )
        ]);
        object.apexTriggerRefs = result[0];
        object.workflowRuleRefs = result[1];
        object.customFieldRefs = result[3];

        // Return data
        return object;
    }
}