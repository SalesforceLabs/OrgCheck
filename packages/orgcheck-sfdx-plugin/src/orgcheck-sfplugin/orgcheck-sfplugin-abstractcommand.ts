import { writeFileSync } from 'node:fs';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, Connection, Logger } from '@salesforce/core';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginLoadThirdParties } from './orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from './orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from './orgcheck-sfplugin-storage-setup.js';

/**
 * @description Import messages directory from meta URL and load them
 */
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@orgcheck/sfdx-plugin', 'global');

/**
 * @description Load third parties
 */
OrgCheckSfPluginLoadThirdParties();

/**
 * @description Check result
 * @interface
 * @public
 */
interface CheckResult {
  orgCheckVersion: string;
  salesforceOrgId: string;
  dateCheck: string;
  action: string;
  result:
    | orgcheck.DataWithScore
    | orgcheck.DataWithScore[]
    | orgcheck.DataMatrixIntf
    | Map<string, boolean>
    | orgcheck.DataCollectionStatisticsIntf[];
}

/**
 * @description Abstract class for all Org Check Salesforce commands
 * @extends {SfCommand<CheckResult>}
 * @class
 * @public
 */
export abstract class OrgCheckSfPluginAbstractCommand extends SfCommand<CheckResult> {
  /**
   * @description Parse flags
   * @returns {Promise<{ flags: Record<string, any>; }>}
   * @protected
   */
  protected abstract parseFlags(): Promise<{ flags: Record<string, any> }>;

  /**
   * @description Get recipe
   * @returns {orgcheck.RecipeAliases}
   * @protected
   */
  protected abstract getRecipe(): orgcheck.RecipeAliases;

  /**
   * @description By default this method is showing results of DataWithScore[] mixture and Table plate
   * @param { orgcheck.DataWithScore | orgcheck.DataWithScore[] | orgcheck.DataMatrixIntf | Map<string, boolean> | orgcheck.DataCollectionStatisticsIntf[] } mixture The mixture to use for display
   * @param { orgcheck.Table | orgcheck.SfdcObjectAsTable | orgcheck.GlobalViewAsTable | orgcheck.Table[] } plate The data to use for display
   * @protected
   */
  protected showResultsInConsole(
      mixture: orgcheck.DataWithScore | orgcheck.DataWithScore[] | orgcheck.DataMatrixIntf | Map<string, boolean> | orgcheck.DataCollectionStatisticsIntf[], 
      plate: orgcheck.Table | orgcheck.SfdcObjectAsTable | orgcheck.GlobalViewAsTable | orgcheck.Table[]): void {

    const defaultMixture = mixture as orgcheck.DataWithScore[];
    const defaultPlate = plate as orgcheck.Table;
    this.logSuccess(defaultPlate.name);
    this.log();
    this.log('Some statistics:')
    this.log(` * number of items: ${defaultPlate.nbAllRows}`);
    this.log(` * number of good items: ${defaultPlate.nbAllRows - defaultPlate.nbBadRows}`);
    this.log(` * number of bad items: ${defaultPlate.nbBadRows}`);
    this.log();
    if (defaultPlate.nbBadRows > 0) {
      this.log('Detail of the bad items (sorted by score desc):');
      this.table({
        columns: [
          { name: 'Score (*)', key: 'score' },
          { name: 'Name', key: 'name' },
          { name: 'Salesforce Id', key: 'id' },
          { name: 'Why this score?', key: 'badReasons' }
        ],
        data: defaultMixture.filter((item) => item.score > 0)
                            .sort((a, b) => b.score - a.score)
                            .map((item) => ({ 
                              id: item.id,
                              name: item.name, 
                              score: item.score, 
                              badReasons: item.badReasonIds.map((i) => { 
                                  const rule = orgcheck.Rules.get(i); 
                                  return `${rule?.description}`; }
                                ).join(', ')
                            })) as any[],
      });
    }
  }

  /**
   * @description Get summary message
   * @param {string} key
   * @returns {string}
   * @static
   * @protected
   */
  protected static getSummaryMessage(key: string): string {
    return messages.getMessage(`check.${key}.summary`);
  }

  /**
   * @description Get description message
   * @param {string} key
   * @returns {string}
   * @static
   * @protected
   */
  protected static getDescriptionMessage(key: string): string {
    return messages.getMessage(`check.${key}.description`);
  }

  /**
   * @description Get examples message
   * @param {string} key
   * @returns {string[]}
   * @static
   * @protected
   */
  protected static getExamplesMessage(key: string): string[] {
    return messages.getMessages(`check.${key}.examples`);
  }

  /**
   * @description Flags
   * @type {Record<string, any>}
   * @public
   */
  public static readonly flags: Record<string, any> = {
    'target-org': Flags.requiredOrg(),
    'accept-the-terms': Flags.boolean({
      char: 'y',
      required: false,
      summary: messages.getMessage('flags.accept-the-terms.summary'),
    }),
    'json-file': Flags.file({
      char: 'j',
      required: false,
      summary: messages.getMessage('flags.json-file.summary'),
    }),
    'xlsx-file': Flags.file({
      char: 'x',
      required: false,
      summary: messages.getMessage('flags.xlsx-file.summary'),
    }),
    'csv-file': Flags.file({
      char: 'c',
      required: false,
      summary: messages.getMessage('flags.csv-file.summary'),
    }),
    package: Flags.string({
      char: 'p',
      required: false,
      summary: messages.getMessage('flags.package.summary'),
    }),
    'sobject-type': Flags.string({
      char: 't',
      required: false,
      summary: messages.getMessage('flags.sobject-type.summary'),
    }),
    sobject: Flags.string({
      char: 's',
      required: false,
      summary: messages.getMessage('flags.sobject.summary'),
    }),
  };

  /**
   * @description Run the command
   * @returns {Promise<CheckResult>}
   * @public
   */
  public async run(): Promise<CheckResult> {
    const { flags } = await this.parseFlags();

    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(
      await Logger.child('OrgCheckSfPluginCommand'),
    );
    const orgcheckApi = orgcheck.ApiFactory.create({
      salesforce: { connection },
      storage: storageSetup,
      logSettings: loggerSetup,
    });

    if ((await orgcheckApi.checkUsageTerms()) === false) {
      if (flags['accept-the-terms'] === true) {
        orgcheckApi.acceptUsageTermsManually();
      } else {
        this.warn(`Accepting the Org Check usage terms is mandatory for Salesforce OrgId: ${orgcheckApi.orgId}`);
        this.log();
        this.logSuccess('Just to let you know...');
        this.log('Using **Org Check** in this Salesforce organization **will** increase its **API Request limit**.');
        this.log('The number of requests it will make to your org  really depends on how much metadata you have.');
        this.log();
        this.logSuccess('What is Salesforce saying about this limit?');
        this.log('If your org reaches or exceeds its daily API request limit, Salesforce still lets the operations');
        this.log('proceed by a certain amount, if possible. It helps avoid blocking your workflows during unexpected');
        this.log('spikes in workloads and occasional peak periods. A hard cap is in place to safeguard platform ');
        this.log('resources and prevent API requests from exceeding the daily limit unimpeded.');
        this.log();
        this.logSuccess('How do we manage this limit in Org Check?');
        this.log('**Org Check** is monitoring the **API Request limit** of your org every time it uses the Salesforce');
        this.log('APIs (and without any additional calls of course!). The usage of this limit will be shown in the');
        this.log('application everytime. Additionally, the application will **warn** you when the limit starts ');
        this.log('reaching **70%**, and, will **stop** working when the limit reaches **90%**.');
        this.log();
        this.logSuccess('Some last comments...');
        this.log('We strongly encourage you to use Org Check in a **dedicated Sandbox** which is not part of your');
        this.log('Salesforce development lifecycle. We discourage you from using the application directly in your');
        this.log('Production. Even if we put in place a control about this limit, we remind you that Salesforce ');
        this.log('Labs applications (like Org Check) have no warranty of any sort (as described in our AppExchange');
        this.log('listing');
        throw new Error(`You need to accept the terms before (using the 'accept-the-terms' flag)`);
      }
    }

    const recipe = this.getRecipe();

    const mixture = await orgcheckApi.prepareData(
      recipe,
      flags['package'] ?? '',
      flags['sobject-type'] ?? '',
      flags['sobject'] ?? '',
    );
    const plate = await orgcheckApi.serveData(recipe, mixture);
    const doggyBag = await orgcheckApi.exportData(recipe, plate);

    const json = {
      orgCheckVersion: orgcheckApi.version,
      salesforceOrgId: orgcheckApi.orgId ?? '<unknown>',
      dateCheck: new Date().toISOString(),
      action: recipe,
      result: mixture,
    };

    if (flags['json-file'] !== undefined) {
      try {
        writeFileSync(flags['json-file'], JSON.stringify(json), { flag: 'w' });
        this.logSuccess(`File ${flags['json-file']} created successfully with JSON format.`);
      } catch (error) {
        this.logToStderr(`File ${flags['json-file']} not created due to the following error: ${error}`)
      }
    }

    if (flags['xlsx-file'] !== undefined) {
      try {
        // Export XLSX logic here
        writeFileSync(flags['xlsx-file'], Buffer.from(orgcheck.TableUtils.exportAsXls(doggyBag)), { flag: 'w' });
        this.logSuccess(`File ${flags['xlsx-file']} created successfully with XLSX format.`);
      } catch (error) {
        this.logToStderr(`File ${flags['xlsx-file']} not created due to the following error: ${error}`)
      }
    }

    if (flags['csv-file'] !== undefined) {
      try {
        // create the file with empty content at first
        writeFileSync(flags['csv-file'], '', { flag: 'w' });
        const exportedTables = Array.isArray(doggyBag) ? doggyBag : [doggyBag];
        exportedTables.forEach((exportedTable) => {
          // Write the Table name first (note the a flag to append the content!)
          writeFileSync(flags['csv-file'], `Table: ${exportedTable.label}`, { flag: 'a' });
          // Write the columns headers
          writeFileSync(flags['csv-file'], csvJoiner(exportedTable.columns), { flag: 'a' });
          // Write the rows
          exportedTable.rows.forEach((row) => {
            writeFileSync(flags['csv-file'], csvJoiner(row), { flag: 'a' });
          });
          // Write a new line
          writeFileSync(flags['csv-file'], '', { flag: 'a' })
        });
        this.logSuccess(`File ${flags['csv-file']} created successfully with CSV format.`);
      } catch (error) {
        this.logToStderr(`File ${flags['csv-file']} not created due to the following error: ${error}`)
      }
    }

    if ((flags['json-file'] === undefined && flags['xlsx-file'] === undefined && flags['csv-file'] === undefined && this.jsonEnabled() === false)) {
      this.showResultsInConsole(mixture, plate);
      this.log();
      this.log('---');
      this.log(`For more information, you can export the data as ${Array.isArray(doggyBag) ? doggyBag.length : 1} table(s) in CSV, XLSX or JSON format from the command line. See help.`);
    }

    return json;
  }
}

const csvJoiner = (row: string[]): string => {
  return `"${row.map((value) => value.replaceAll('"', '""')).join('","')}"`;
};