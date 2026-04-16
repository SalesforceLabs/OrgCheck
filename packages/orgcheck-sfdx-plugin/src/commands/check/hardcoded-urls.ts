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
  * @returns {orgcheck.RecipeAliases | undefined}
  * @public
  */
  protected getRecipe(): orgcheck.RecipeAliases | undefined {
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
        { name: 'Type of items ', key: 'type' },
        { name: 'Salesforce Hardcoded URLs detected', key: 'urls' },
        { name: 'Items to check (*)', key: 'bad' },
        { name: 'Items with no issue', key: 'good' },
        { name: 'Total number of items scanned', key: 'all' },
      ],
      data: mixture.filter((m) => m.countAll > 0)
                   .sort((a, b) => b.countBad !== a.countBad ? b.countBad - a.countBad : b.countAll - a.countAll)
                   .map((m) => ({
                      type: m.recipeTitle,
                      urls: m.distinctBadValues.join(', '),
                      bad: m.countBad,
                      good: m.countGood,
                      all: m.countAll
                   })) as any[]
    });

    this.log('Items to check (max 100 items):')
    this.table({
      columns: [
        { name: 'Name', key: 'name' },
        { name: 'Salesforce Id', key: 'id' },
        { name: 'Type', key: 'type' },
        { name: 'Salesforce Hardcoded URLs detected', key: 'badUrls' }
      ],
      data: mixture.map(m => (
        m.badItems.map(item => ({ 
                    type: m.recipeTitle, 
                    id: item.data.id, 
                    name: item.data.name,
                    badUrls: item.badValues
                  }))
        )).flat().filter((_item, i) => i < 100)
    });
  }
}
