import { Recipe } from '../core/orgcheck-api-recipe';
import { Processor } from '../core/orgcheck-api-processor';
import { Data, DataWithoutScore } from '../core/orgcheck-api-data';
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

export class RecipeObject implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf, parameters: Map<string, any>): Array<string | DatasetRunInformation> {
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
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types: Map<string, SFDC_ObjectType> = data.get(DatasetAliases.OBJECTTYPES);
        const /** @type {SFDC_Object} */ object: SFDC_Object = data.get(DatasetAliases.OBJECT);
        const /** @type {Map<string, SFDC_ApexTrigger>} */ apexTriggers: Map<string, SFDC_ApexTrigger> = data.get(DatasetAliases.APEXTRIGGERS);
        const /** @type {Map<string, SFDC_Workflow>} */ workflowRules: Map<string, SFDC_Workflow> = data.get(DatasetAliases.WORKFLOWS);
        const /** @type {Map<string, SFDC_LightningPage>} */ pages: Map<string, SFDC_LightningPage> = data.get(DatasetAliases.LIGHTNINGPAGES);
        const /** @type {Map<string, SFDC_Field>} */ customFields: Map<string, SFDC_Field> = data.get(DatasetAliases.CUSTOMFIELDS);

        // Checking data
        if (!types) throw new Error(`RecipeObject: Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!object) throw new Error(`RecipeObject: Data from dataset alias 'OBJECT' was undefined.`);
        if (!apexTriggers) throw new Error(`RecipeObject: Data from dataset alias 'APEXTRIGGERS' was undefined.`);
        if (!workflowRules) throw new Error(`RecipeObject: Data from dataset alias 'WORKFLOWS' was undefined.`);
        if (!pages) throw new Error(`RecipeObject: Data from dataset alias 'LIGHTNINGPAGES' was undefined.`);
        if (!customFields) throw new Error(`RecipeObject: Data from dataset alias 'CUSTOMFIELDS' was undefined.`);

        // Augment data
        const typeRef = types.get(object.typeId);
        if (typeRef) {
            object.typeRef = typeRef;
        }
        object.flexiPages = [];
        const result = await Promise.all([
            Processor.map( // returns apexTriggerRefs
                object.apexTriggerIds,
                (id: string) => { 
                    const apexTrigger = apexTriggers.get(id);
                    if (apexTrigger) {
                        apexTrigger.objectRef = object;
                    } else {
                        throw new Error(`Apex Trigger ${id} was not found for object ${object.name}`)
                    }
                    return apexTrigger;
                },
                (id: string) => apexTriggers.has(id)
            ),
            Processor.map( // returns workflowRuleRefs
                object.workflowRuleIds,
                (id: string) => workflowRules.get(id),
                (id: string) => workflowRules.has(id)
            ),
            Processor.forEach(pages, (/** @type {SFDC_LightningPage} */ page: SFDC_LightningPage) => {
                if (page.objectId === object.id) {
                    object.flexiPages.push(page);
                }
            }),
            Processor.map( // returns customFieldRefs
                object.customFieldIds,
                (id: string) => { 
                    const customField = customFields.get(id);
                    if (customField) {
                        customField.objectRef = object;
                    } else {
                        throw new Error(`Custom Field ${id} was not found for object ${object.name}`)
                    }
                    return customField;
                },
                (id: string) => customFields.has(id)
            )
        ]);
        object.apexTriggerRefs = result[0];
        object.workflowRuleRefs = result[1];
        object.customFieldRefs = result[3];

        // Return data
        return object;
    }
}