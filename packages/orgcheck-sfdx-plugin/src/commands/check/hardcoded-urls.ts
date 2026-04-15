import { OrgCheckSfPluginAbstractCommand } from '../../orgcheck-sfplugin/orgcheck-sfplugin-abstractcommand.js';
import orgcheck from '@orgcheck/api';

/**
 * @description Check Apex Classes command
 * @extends {OrgCheckSfPluginAbstractCommand}
 * @class
 * @public
 */
export class CheckHardcodedUrls extends OrgCheckSfPluginAbstractCommand {
  /**
   * @description Summary of the command
   * @type {string}
   * @public
   */
  public static readonly summary: string = OrgCheckSfPluginAbstractCommand.getSummaryMessage('hardcoded-urls');

  /**
   * @description Description of the command
   * @type {string}
   * @public
   */
  public static readonly description: string = OrgCheckSfPluginAbstractCommand.getDescriptionMessage('hardcoded-urls');

  /**
   * @description Examples of the command
   * @type {string[]}
   * @public
   */
  public static readonly examples: string[] = OrgCheckSfPluginAbstractCommand.getExamplesMessage('hardcoded-urls');

  /**
   * @description Parse flags
   * @returns {Promise<{ flags: Record<string, any>; }>}
   * @public
   */
  protected parseFlags(): Promise<{ flags: Record<string, any> }> {
    return this.parse(CheckHardcodedUrls);
  }

  /**
   * @description Get recipe
   * @returns {orgcheck.RecipeAliases}
   * @public
   */
  protected getRecipe(): orgcheck.RecipeAliases {
    return orgcheck.Recipes.HARDCODED_URLS_VIEW;
  }
  
  /**
   * @description By default this method is showing results of DataWithScore[] mixture and Table plate
   * @param { orgcheck.DataCollectionStatisticsIntf[] } mixture The mixture to use for display
   * @param { orgcheck.Table } plate The data to use for display
   * @protected
   */
  protected showResultsInConsole(mixture: orgcheck.DataCollectionStatisticsIntf[], plate: orgcheck.Table): void {

    this.logSuccess(plate.name);
    this.log();

    this.log('Some statistics:');
    this.table({
      columns: [
        { name: 'Type of items ', key: 'recipeTitle' },
        { name: 'Salesforce Hardcoded URLs detected', key: 'distinctBadValues' },
        { name: 'Items to check (*)', key: 'countBad' },
        { name: 'Items with no issue', key: 'countGood' },
        { name: 'Total number of items scanned', key: 'countAll' },
      ],
      data: mixture as any[]
    });

    this.log('Items to check:')
    this.table({
      columns: [
        { name: 'Score (*)', key: 'score' },
        { name: 'Name', key: 'name' },
        { name: 'Salesforce Id', key: 'id' },
        { name: 'Type', key: 'type' },
        { name: 'Why this score?', key: 'reasons' }
      ],
      data: mixture.map(m => (
        m.badItems.filter((item) => item.score > 0)
                  .map(item => ({ 
                    type: m.recipeTitle, 
                    id: item.id, 
                    name: item.name, 
                    score: item.score,
                    reasons: item.badReasonIds.map((i) => orgcheck.Rules.get(i)?.description).join(', ')
                  }))
        )).flat().sort((a, b) => b.score - a.score),
    });
  }
}
