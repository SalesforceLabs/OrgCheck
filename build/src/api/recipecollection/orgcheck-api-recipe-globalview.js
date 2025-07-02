import { RecipeCollection } from '../core/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { RecipeAliases } from '../orgcheck-api-main';

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
}