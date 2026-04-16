import { OrgCheckSfPluginAbstractCommand } from '../../orgcheck-sfplugin/orgcheck-sfplugin-abstractcommand.js';
import orgcheck from '@orgcheck/api';

/**
 * @description Check Apex Classes command
 * @extends {OrgCheckSfPluginAbstractCommand}
 * @class
 * @public
 */
export class RunAllTests extends OrgCheckSfPluginAbstractCommand {
  /**
   * @description Summary of the command
   * @type {string}
   * @public
   */
  public static readonly summary: string = OrgCheckSfPluginAbstractCommand.getSummaryMessage('run-all-tests');

  /**
   * @description Description of the command
   * @type {string}
   * @public
   */
  public static readonly description: string = OrgCheckSfPluginAbstractCommand.getDescriptionMessage('run-all-tests');

  /**
   * @description Examples of the command
   * @type {string[]}
   * @public
   */
  public static readonly examples: string[] = OrgCheckSfPluginAbstractCommand.getExamplesMessage('run-all-tests');

  /**
   * @description Parse flags
   * @returns {Promise<{ flags: Record<string, any>; }>}
   * @public
   */
  protected parseFlags(): Promise<{ flags: Record<string, any> }> {
    return this.parse(RunAllTests);
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
      const executionId = await orgcheckApi.runAllTestsAsync()
      // Log the success
      this.logSuccess(`We started an async run of all tests in this org. Please check ${executionId}`);
    } catch (error) {
      // Log the error if any
      this.logToStderr(`We couldn't start the async run of all classes for the following reason: ${error}`)
    }
    return `run-all-tests`;
  }

}
