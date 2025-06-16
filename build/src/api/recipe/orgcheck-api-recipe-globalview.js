import { Recipe } from '../core/orgcheck-api-recipe';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { DatasetRunInformation } from '../core/orgcheck-api-dataset-runinformation';
import { DatasetAliases } from '../core/orgcheck-api-datasets-aliases';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';
import { SecretSauce } from '../core/orgcheck-api-secretsauce';
import { Processor } from '../core/orgcheck-api-processing';

const COLORS = [
    '#2f89a8', '#fdc223', '#5fc9f8', '#f8b195', '#f67280', 
    '#c06c84', '#6c5b7b', '#355c7d', '#b56576', '#f8b195', 
    '#f67280', '#c06c84', '#6c5b7b', '#355c7d', '#b56576'
];

export class RecipeGlobalView extends Recipe {

    /**
     * @description List all dataset aliases (or datasetRunInfo) that this recipe is using
     * @param {SimpleLoggerIntf} logger
     * @returns {Array<string | DatasetRunInformation>}
     * @public
     */
    extract(logger) {
        return [
            DatasetAliases.INTERNALACTIVEUSERS,
            DatasetAliases.APEXCLASSES,
            DatasetAliases.APEXTRIGGERS,
            DatasetAliases.COLLABORATIONGROUPS,
            DatasetAliases.CUSTOMFIELDS,
            DatasetAliases.CUSTOMLABELS,
            DatasetAliases.CUSTOMTABS,
            DatasetAliases.DOCUMENTS,
            DatasetAliases.FLOWS,
            DatasetAliases.EMAILTEMPLATES,
            DatasetAliases.HOMEPAGECOMPONENTS,
            DatasetAliases.KNOWLEDGEARTICLES,
            DatasetAliases.LIGHTNINGAURACOMPONENTS,
            DatasetAliases.LIGHTNINGPAGES,
            DatasetAliases.LIGHTNINGWEBCOMPONENTS,
            DatasetAliases.PAGELAYOUTS,
            DatasetAliases.PERMISSIONSETS,
            DatasetAliases.PERMISSIONSETLICENSES,
            DatasetAliases.PROFILEPWDPOLICIES,
            DatasetAliases.PROFILERESTRICTIONS,
            DatasetAliases.PROFILES,
            DatasetAliases.PUBLIC_GROUPS_AND_QUEUES,
            DatasetAliases.RECORDTYPES,
            DatasetAliases.USERROLES,
            DatasetAliases.VALIDATIONRULES,
            DatasetAliases.VISUALFORCECOMPONENTS,
            DatasetAliases.VISUALFORCEPAGES,
            DatasetAliases.WEBLINKS,
            DatasetAliases.WORKFLOWS
        ];
    }

    /**
     * @description transform the data from the datasets and return the final result as a Map
     * @param {Map} data Records or information grouped by datasets (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {string} scoreRuleCategory Name of the score rule category (if all use '*')
     * @returns {Promise<Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>}
     * @async
     * @public
     */
    async transform(data, logger, scoreRuleCategory) {

        const array = [];

        await Processor.forEach(data, (items, key) => {

            let records = [... items.values()];

            // if needed we filter the records by scoreRuleCategory
            if (scoreRuleCategory && scoreRuleCategory !== '*') {
                const scoreRuleIds = SecretSauce.GetScoreRulesWithCategory(scoreRuleCategory);
                if (scoreRuleIds && scoreRuleIds.length > 0) {
                    records = records
                        .filter((r) => r.badReasonIds.some(id => scoreRuleIds.includes(id)))
                        .map((r) => {
                            r.badReasonIds = r.badReasonIds.filter(id => scoreRuleIds.includes(id)) // keep only the bad reasons that match the filter
                            return r;
                        });
                }
            }

            const badOnes = records?.filter((r) => r?.score > 0).length ?? 0;
            const series = new Map();
            records?.forEach((d) => { 
                d.badReasonIds.forEach(id => {
                    series.set(id, series.has(id) ? (series.get(id) + 1) : 1);
                });
            });

            array.push({
                key: key,
                goodBadData: [ 
                    { name: 'Bad',  value: badOnes,  color: 'red' }, 
                    { name: 'Good', value: ((records?.length ?? 0) - badOnes), color: 'green' } 
                ],
                badByRuleData: Array.from(series.keys()).map((id, index) => { return { 
                    name: SecretSauce.GetScoreRuleDescription(id), 
                    value: series.get(id), 
                    color: COLORS[index]
                }}),
                hasData: (records && records.length > 0)
            });

            logger.debug(`RecipeGlobalView: key=${key}`);

        });

        // Return data
        return array;
    }
}