import { RecipeCollection } from 'src/api/core/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';
import { ScoreRule } from 'src/api/core/orgcheck-api-datafactory';

export class RecipeGlobalView implements RecipeCollection {

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string>} List of recipe aliases that this recipe collection needs
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string> {
        return [
            RecipeAliases.APEX_CLASSES,
            RecipeAliases.APEX_TESTS,
            RecipeAliases.APEX_TRIGGERS,
            RecipeAliases.APEX_UNCOMPILED,
            RecipeAliases.BROWSERS,
            RecipeAliases.COLLABORATION_GROUPS,
            RecipeAliases.CUSTOM_FIELDS,
            RecipeAliases.CUSTOM_LABELS,
            RecipeAliases.CUSTOM_TABS,
            RecipeAliases.DASHBOARDS,
            RecipeAliases.DOCUMENTS,
            RecipeAliases.EMAIL_TEMPLATES,
            RecipeAliases.FLOWS,
            RecipeAliases.HOME_PAGE_COMPONENTS,
            RecipeAliases.INTERNAL_ACTIVE_USERS,
            RecipeAliases.KNOWLEDGE_ARTICLES,
            RecipeAliases.LIGHTNING_AURA_COMPONENTS,
            RecipeAliases.LIGHTNING_PAGES,
            RecipeAliases.LIGHTNING_WEB_COMPONENTS,
            RecipeAliases.OBJECTS,
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
            RecipeAliases.REPORTS,
            RecipeAliases.STATIC_RESOURCES,
            RecipeAliases.USER_ROLES,
            RecipeAliases.VALIDATION_RULES,
            RecipeAliases.VISUALFORCE_COMPONENTS,
            RecipeAliases.VISUALFORCE_PAGES,
            RecipeAliases.WEBLINKS,
            RecipeAliases.WORKFLOWS
        ];
    }

    /**
     * @description Filter the data items by score rules
     * @returns {Array<ScoreRule>} List of score rule to filter by. Empty array means no filtering
     * @public
     */ 
    filterByScoreRules(): Array<ScoreRule> {
        return [];
    }
}