import { RecipeCollection } from '../core/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from '../core/orgcheck-api-logger';
import { RecipeAliases } from '../core/orgcheck-api-recipes-aliases';
import { SecretSauce } from '../core/orgcheck-api-secretsauce';

export class RecipeHardcodedURLsView implements RecipeCollection {

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string>} List of recipe aliases that this recipe collection needs
     * @public
     */
    extract(_logger: SimpleLoggerIntf): Array<string> {
        return [
            RecipeAliases.APEX_CLASSES,
            RecipeAliases.APEX_TRIGGERS,
            RecipeAliases.COLLABORATION_GROUPS,
            RecipeAliases.CUSTOM_FIELDS,
            RecipeAliases.CUSTOM_TABS,
            RecipeAliases.DOCUMENTS,
            RecipeAliases.EMAIL_TEMPLATES,
            RecipeAliases.HOME_PAGE_COMPONENTS,
            RecipeAliases.VALIDATION_RULES,
            RecipeAliases.VISUALFORCE_COMPONENTS,
            RecipeAliases.VISUALFORCE_PAGES,
            RecipeAliases.WEBLINKS
        ];
    }

    /**
     * @description Filter the data items by score rule ids
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<number>} List of score rule ids to filter by. Empty array means no filtering
     * @public
     */ 
    filterByScoreRuleIds(_logger: SimpleLoggerIntf): Array<number> {
        return SecretSauce.GetScoreRulesForHardCodedURLs();
    }
}