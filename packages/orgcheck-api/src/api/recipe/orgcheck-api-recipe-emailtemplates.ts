import { Recipe } from '../core/orgcheck-api-recipe';
import { Data, DataWithoutScore } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SFDC_EmailTemplate } from '../data/orgcheck-api-data-emailtemplate';
import { Processor } from '../core/orgcheck-api-processor';
import { OrgCheckGlobalParameter } from '../core/orgcheck-api-globalparameter';

export class RecipeEmailTemplates implements Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfos) that this recipe is using
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string | DatasetRunInformation>} The datasets aliases that this recipe is using
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string | DatasetRunInformation> {
        return [DatasetAliases.EMAILTEMPLATES];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map<string, any>} data - Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} _logger - Logger
     * @param {Map<string, any>} [parameters] - List of optional argument to pass
     * @returns {Promise<Array<Data> | DataMatrix | Data | Map<string, any>>} Returns as it is the value returned by the transform method recipe.
     * @async
     * @public
     */
    async transform(data: Map<string, any>, _logger: SimpleLoggerIntf, parameters: Map<string, any>): Promise<Array<Data> | DataMatrix | Data | Map<string, any>> {

        // Get data and parameters
        const /** @type {Map<string, SFDC_EmailTemplate>} */ emailTemplates: Map<string, SFDC_EmailTemplate> = data.get(DatasetAliases.EMAILTEMPLATES);
        const namespace = OrgCheckGlobalParameter.getPackageName(parameters);

        // Checking data
        if (!emailTemplates) throw new Error(`RecipeDocuments: Data from dataset alias 'EMAILTEMPLATES' was undefined.`);

        // Filter data
        /** @type {Array<SFDC_EmailTemplate>} */
        const array: Array<SFDC_EmailTemplate> = [];
        await Processor.forEach(emailTemplates, (/** @type {SFDC_EmailTemplate} */ emailTemplate: SFDC_EmailTemplate) => {
            if (namespace === OrgCheckGlobalParameter.ALL_VALUES || emailTemplate.package === namespace) {
                array.push(emailTemplate);
            }
        });

        // Return data
        return array;
    }
}