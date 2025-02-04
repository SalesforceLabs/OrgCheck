import { OrgCheckRecipe } from '../core/orgcheck-api-recipe';
import { OrgCheckProcessor } from '../core/orgcheck-api-processing';
import { OrgCheckData, OrgCheckDataWithoutScoring } from '../core/orgcheck-api-data';
import { OrgCheckSimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { OrgCheckDatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { OrgCheckDatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { SFDC_CustomLabel } from '../data/orgcheck-api-data-customlabel';
import { OrgCheckDataMatrix } from '../core/orgcheck-api-data-matrix';
import { SFDC_ValidationRule } from '../data/orgcheck-api-data-validationrule';
import { SFDC_Object } from '../data/orgcheck-api-data-object';
import { SFDC_ObjectType } from '../data/orgcheck-api-data-objecttype';

export class OrgCheckRecipeValidationRules extends OrgCheckRecipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Array<string | OrgCheckDatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            OrgCheckDatasetAliases.VALIDATIONRULES,
            OrgCheckDatasetAliases.OBJECTTYPES, 
            OrgCheckDatasetAliases.OBJECTS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {OrgCheckSimpleLoggerIntf} logger
     * @returns {Promise<Array<OrgCheckData | OrgCheckDataWithoutScoring> | OrgCheckDataMatrix | OrgCheckData | OrgCheckDataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger) {

        // Get data
        const /** @type {Map<string, SFDC_ObjectType>} */ types = data.get(OrgCheckDatasetAliases.OBJECTTYPES);
        const /** @type {Map<string, SFDC_Object>} */ objects = data.get(OrgCheckDatasetAliases.OBJECTS);
        const /** @type {Map<string, SFDC_ValidationRule>} */ validationRules = data.get(OrgCheckDatasetAliases.VALIDATIONRULES);

        // Checking data
        if (!types) throw new Error(`Data from dataset alias 'OBJECTTYPES' was undefined.`);
        if (!objects) throw new Error(`Data from dataset alias 'OBJECTS' was undefined.`);
        if (!validationRules) throw new Error(`Data from dataset alias 'VALIDATIONRULES' was undefined.`);

        // Augment data
        await OrgCheckProcessor.forEach(validationRules, (validationRule) => {
            const object = objects.get(validationRule.objectId);
            if (object && !object.typeRef) {
                object.typeRef = types.get(object.typeId);
            }
            validationRule.objectRef = object;
        });

        // Return data
        return [... validationRules.values()];
    }
}