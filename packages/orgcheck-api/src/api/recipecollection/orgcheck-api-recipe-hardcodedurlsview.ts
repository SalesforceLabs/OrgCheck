import { RecipeCollection } from 'src/api/core/orgcheck-api-recipecollection';
import { SimpleLoggerIntf } from 'src/api/core/orgcheck-api-logger';
import { RecipeAliases } from 'src/api/core/orgcheck-api-recipes-aliases';
import { SecretSauce } from 'src/api/core/orgcheck-api-secretsauce';
import { ScoreRule } from 'src/orgcheck';

export class RecipeHardcodedURLsView implements RecipeCollection {

    /**
     * @description List the parameters that this recipe collection dependes on
     * @returns {string[]} List of parameters that this recipe collection dependes on
     * @public
     */
    public ingredientsDependencies(): string[] {
        return [];
    }

    /**
     * @description List all recipe aliases that this recipe collection needs
     * @param {SimpleLoggerIntf} _logger - Logger
     * @returns {Array<string>} List of recipe aliases that this recipe collection needs
     * @public
     */
    public ingredients(_logger: SimpleLoggerIntf): Array<string> {
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
     * @description Filter the data items by score rules
     * @returns {Array<ScoreRule>} List of score rule to filter by. Empty array means no filtering
     * @public
     */ 
    filterByScoreRules(): Array<ScoreRule> {
        return SecretSauce.GetScoreRulesForHardCodedURLs();
    }
}