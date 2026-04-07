import { RecipeAliases } from "@orgcheck/api";
import { OrgCheckSfPluginAbstractCommand } from "../../orgcheck-sfplugin/orgcheck-sfplugin-abstractcommand.js";
import orgcheck from '@orgcheck/api';

/**
 * @description Check Apex Classes command
 * @extends {OrgCheckSfPluginAbstractCommand}
 * @class
 * @public
 */
export class CheckGlobalView extends OrgCheckSfPluginAbstractCommand {

    /**
     * @description Summary of the command
     * @type {string}
     * @public
     */
    public static readonly summary: string = OrgCheckSfPluginAbstractCommand.getSummaryMessage('global-view');

    /**
     * @description Description of the command
     * @type {string}
     * @public
     */
    public static readonly description: string = OrgCheckSfPluginAbstractCommand.getDescriptionMessage('global-view');

    /**
     * @description Examples of the command
     * @type {string[]}
     * @public
     */
    public static readonly examples: string[] = OrgCheckSfPluginAbstractCommand.getExamplesMessage('global-view');

    /**
     * @description Parse flags
     * @returns {Promise<{ flags: Record<string, any>; }>}
     * @public
     */
    protected parseFlags(): Promise<{ flags: Record<string, any>; }> {
        return this.parse(CheckGlobalView);
    }

    /**
     * @description Get recipe
     * @returns {RecipeAliases}
     * @public
     */
    protected getRecipe(): RecipeAliases {
        return orgcheck.Recipes.GLOBAL_VIEW;
    }
}