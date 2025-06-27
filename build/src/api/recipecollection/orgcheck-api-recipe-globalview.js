import { RecipeCollection } from '../core/orgcheck-api-recipe';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { SecretSauce } from '../core/orgcheck-api-secretsauce';
import { Processor } from '../core/orgcheck-api-processor';
import { RecipeAliases } from '../orgcheck-api-main';
import { Data, DataWithoutScoring } from '../core/orgcheck-api-data';
import { DataMatrix } from '../core/orgcheck-api-data-matrix';

export class RecipeGlobalView extends RecipeCollection {

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Array<string>}
     * @public
     */
    extract(logger, parameters) {
        return [
            RecipeAliases.APEX_CLASSES,
            RecipeAliases.APEX_TESTS,
            RecipeAliases.APEX_TRIGGERS,
            RecipeAliases.APEX_UNCOMPILED,
            RecipeAliases.COLLABORATION_GROUPS,
            RecipeAliases.CUSTOM_FIELDS,
            RecipeAliases.CUSTOM_LABELS,
            RecipeAliases.CUSTOM_TABS,
            RecipeAliases.DOCUMENTS,
            RecipeAliases.EMAIL_TEMPLATES,
            RecipeAliases.FLOWS,
            RecipeAliases.HOME_PAGE_COMPONENTS,
            RecipeAliases.INTERNAL_ACTIVE_USERS,
            RecipeAliases.KNOWLEDGE_ARTICLES,
            RecipeAliases.LIGHTNING_AURA_COMPONENTS,
            RecipeAliases.LIGHTNING_PAGES,
            RecipeAliases.LIGHTNING_WEB_COMPONENTS,
            RecipeAliases.PAGE_LAYOUTS,
            RecipeAliases.PERMISSION_SETS,
            RecipeAliases.PERMISSION_SET_LICENSES,
            RecipeAliases.PROCESS_BUILDERS,
            RecipeAliases.PROFILE_PWD_POLICIES,
            RecipeAliases.PROFILE_RESTRICTIONS,
            RecipeAliases.PROFILES,
            RecipeAliases.PUBLIC_GROUPS,
            RecipeAliases.QUEUES,
            RecipeAliases.RECORD_TYPES,
            RecipeAliases.USER_ROLES,
            RecipeAliases.VALIDATION_RULES,
            RecipeAliases.VISUALFORCE_COMPONENTS,
            RecipeAliases.VISUALFORCE_PAGES,
            RecipeAliases.WEBLINKS,
            RecipeAliases.WORKFLOWS
        ];
    }

    /**
     * @description transform the data from the recipes and return the final result as a Map
     * @param {Map<string, Array<Data | DataWithoutScoring> | DataMatrix | Data | DataWithoutScoring | Map>} data Records or information grouped by recipes (given by their alias) in a Map
     * @param {SimpleLoggerIntf} logger
     * @param {Map | undefined} [parameters] List of optional argument to pass
     * @returns {Promise<Map>}
     * @async
     * @public
     */
    async transform(data, logger, parameters) {

        const map = new Map();

        await Processor.forEach(data, (records, key) => {
            const filteredRecords = records?.filter((r) => r.score && r.score > 0)?.sort((a, b) => a.score > b.score);
            const countAll = (records?.length ?? 0);
            const countBadOnes = (filteredRecords?.length ?? 0);
            const series = new Map();
            filteredRecords?.forEach((d) => { 
                d.badReasonIds.forEach(id => {
                    series.set(id, series.has(id) ? (series.get(id) + 1) : 1);
                });
            });
            map.set(
                key, 
                {
                    countAll: countAll,
                    countBad: countBadOnes,
                    countGood: countAll - countBadOnes,
                    countBadByRule: Array.from(series.keys()).map((id) => { return { 
                        ruleId: id,
                        ruleName: SecretSauce.GetScoreRuleDescription(id), 
                        count: series.get(id)
                    }}),
                    data: filteredRecords
                }
            );
        });

        // Return data
        return map;
    }
}