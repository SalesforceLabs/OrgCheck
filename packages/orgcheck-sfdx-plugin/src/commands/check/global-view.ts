import { OrgCheckSfPluginAbstractCommand } from '../../orgcheck-sfplugin/orgcheck-sfplugin-abstractcommand.js';
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
  protected parseFlags(): Promise<{ flags: Record<string, any> }> {
    return this.parse(CheckGlobalView);
  }

  /**
   * @description Get recipe
   * @returns {orgcheck.RecipeAliases | undefined}
   * @public
   */
  protected getRecipe(): orgcheck.RecipeAliases | undefined {
    return orgcheck.Recipes.GLOBAL_VIEW;
  }

  /**
   * @description By default this method is showing results of DataWithScore[] mixture and Table plate
   * @param { orgcheck.DataCollectionStatisticsIntf[] } mixture The mixture to use for display
   * @param { orgcheck.GlobalViewAsTable } plate The data to use for display
   * @protected
   */
  protected showResultsInConsole(mixture: orgcheck.DataCollectionStatisticsIntf[], plate: orgcheck.GlobalViewAsTable): void {

    this.logSuccess(plate.name);
    this.log();

    this.log('Items:');
    this.table({
      columns: [
        { name: 'Type of items ', key: 'recipeTitle' },
        { name: 'Items to check (*)', key: 'countBad' },
        { name: 'Items with no issue', key: 'countGood' },
        { name: 'Total number of items scanned', key: 'countAll' },
      ],
      data: mixture as any[]
    });

    this.log('Items to check (max 100 items):')
    this.table({
      columns: [
        { name: 'Score (*)', key: 'score' },
        { name: 'Name', key: 'name' },
        { name: 'Salesforce Id', key: 'id' },
        { name: 'Type', key: 'type' },
        { name: 'Why this score?', key: 'reasons' }
      ],
      data: mixture.map(m => (
        m.badItems.map(item => ({ 
                    type: m.recipeTitle, 
                    id: item.data.id, 
                    name: item.data.name, 
                    score: item.data.score,
                    reasons: item.data.badReasonIds.map((i) => orgcheck.Rules.get(i)?.description).join(', ')
                  }))
        )).flat().filter((_item, i) => i < 100)
    });
  }
}
