import { OrgCheckSfPluginAbstractCommand } from '../../orgcheck-sfplugin/orgcheck-sfplugin-abstractcommand.js';
import orgcheck from '@orgcheck/api';

/**
 * @description Check Apex Classes command
 * @extends {OrgCheckSfPluginAbstractCommand}
 * @class
 * @public
 */
export class ClearAllCache extends OrgCheckSfPluginAbstractCommand {
  /**
   * @description Summary of the command
   * @type {string}
   * @public
   */
  public static readonly summary: string = OrgCheckSfPluginAbstractCommand.getSummaryMessage('clear-all-cache');

  /**
   * @description Description of the command
   * @type {string}
   * @public
   */
  public static readonly description: string = OrgCheckSfPluginAbstractCommand.getDescriptionMessage('clear-all-cache');

  /**
   * @description Examples of the command
   * @type {string[]}
   * @public
   */
  public static readonly examples: string[] = OrgCheckSfPluginAbstractCommand.getExamplesMessage('clear-all-cache');

  /**
   * @description Parse flags
   * @returns {Promise<{ flags: Record<string, any>; }>}
   * @public
   */
  protected parseFlags(): Promise<{ flags: Record<string, any> }> {
    return this.parse(ClearAllCache);
  }

  /**
   * @description Get recipe
   * @returns {orgcheck.RecipeAliases | undefined}
   * @public
   */
  protected getRecipe(): orgcheck.RecipeAliases | undefined {
    return undefined;
  }

  /**
   * @description Do some special thing with API when no recipe is returned from "getRecipe"
   * @param {orgcheck.ApiIntf} orgcheckApi 
   * @returns {string} Nale of the action
   * @async
   */
  protected async doSpecialThingWithApi(orgcheckApi: orgcheck.ApiIntf): Promise<string> {
    try {
      // do the thing !
      orgcheckApi.clearCache();
      // Log the success
      this.logSuccess('Cache cleared for this org.')
    } catch (error) {
      // Log the error if any
      this.logToStderr(`We couldn't clear the cache for this org for the following reason: ${error}`)
    }
    return `clear-all-cache`;
  }

}
