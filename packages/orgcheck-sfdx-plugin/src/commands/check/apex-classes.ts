import { RecipeAliases } from "@orgcheck/api";
import { OrgCheckSfPluginAbstractCommand } from "../../orgcheck-sfplugin/orgcheck-sfplugin-abstractcommand.js";
import orgcheck from '@orgcheck/api';

/**
 * @description Check Apex Classes command
 * @extends {OrgCheckSfPluginAbstractCommand}
 * @class
 * @public
 */
export class CheckApexClasses extends OrgCheckSfPluginAbstractCommand {

    /**
     * @description Summary of the command
     * @type {string}
     * @public
     */
    public static readonly summary: string = OrgCheckSfPluginAbstractCommand.getSummaryMessage('apex-classes');

    /**
     * @description Description of the command
     * @type {string}
     * @public
     */
    public static readonly description: string = OrgCheckSfPluginAbstractCommand.getDescriptionMessage('apex-classes');

    /**
     * @description Examples of the command
     * @type {string[]}
     * @public
     */
    public static readonly examples: string[] = OrgCheckSfPluginAbstractCommand.getExamplesMessage('apex-classes');

    /**
     * @description Parse flags
     * @returns {Promise<{ flags: Record<string, any>; }>}
     * @public
     */
    protected parseFlags(): Promise<{ flags: Record<string, any>; }> {
        return this.parse(CheckApexClasses);
    }

    /**
     * @description Get recipe
     * @returns {RecipeAliases}
     * @public
     */
    protected getRecipe(): RecipeAliases {
        return orgcheck.Recipes.APEX_CLASSES;
    }
}