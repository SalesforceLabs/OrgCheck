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
const messages = Messages.loadMessages('orgcheck-sfdx-plugin', 'global');

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
    | orgcheck.Data
    | orgcheck.Data[]
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
      writeFileSync(flags['json-file'], JSON.stringify(json), { flag: 'w' });
    }

    if (flags['xlsx-file'] !== undefined) {
      // Export XLSX logic here
      writeFileSync(flags['xlsx-file'], Buffer.from(orgcheck.TableUtils.exportAsXls(doggyBag)), { flag: 'w' });
    }

    if (this.jsonEnabled() === false) {
      const exportedTables = Array.isArray(doggyBag) ? doggyBag : [doggyBag];
      exportedTables.forEach((exportedTable) => {
        this.log(`Table: ${exportedTable.label}`);
        this.log(csvJoiner(exportedTable.columns));
        exportedTable.rows.forEach((row) => {
          this.log(csvJoiner(row));
        });
        this.log();
      });
    }

    return json;
  }
}

const csvJoiner = (row: string[]): string => {
  return `"${row.map((value) => value.replaceAll('"', '""')).join('","')}"`;
};
