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
  * @returns {orgcheck.RecipeAliases | undefined}
  * @public
  */
  protected abstract getRecipe(): orgcheck.RecipeAliases | undefined;

  /**
   * @description Do some special thing with API when no recipe is returned from "getRecipe"
   * @param {orgcheck.ApiIntf} orgcheckApi 
   * @returns {string} Nale of the action
   * @async
   */
  protected async doSpecialThingWithApi(orgcheckApi: orgcheck.ApiIntf): Promise<string> {
    void orgcheckApi;
    return '';
  }

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
    'invalidate-cache': Flags.boolean({
      char: 'i',
      required: false,
      summary: messages.getMessage('flags.invalidate-cache.summary')
    })
  };

  /**
   * @description Run the command
   * @returns {Promise<CheckResult>}
   * @public
   */
  public async run(): Promise<CheckResult> {
    const { flags } = await this.parseFlags();

    // Initialize some variables
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const orgId: string = connection.getAuthInfoFields().orgId ?? 'unknown-org';
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup(orgId);
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(
      await Logger.child('OrgCheckSfPluginCommand'),
      this.spinner
    );
    
    // Create the Org Check API
    const orgcheckApi = orgcheck.ApiFactory.create({
      salesforce: { connection },
      storage: storageSetup,
      logSettings: loggerSetup,
    });

    // First thing, we want to check if usage terms need to be accepted
    if ((await orgcheckApi.checkUsageTerms()) === false) {

      // The usage terms need to be accepted
      // In this case, we need the flag "accept-the-terms" to be specified
      if (flags['accept-the-terms'] === true) {

        // User specified the flag to manually accept the usage terms
        orgcheckApi.acceptUsageTermsManually();

      } else {

        // User did not specify anything but we need it.
        // Let's show these terms that we need to accept.
        this.warn(`Accepting the Org Check usage terms is mandatory for Salesforce OrgId: ${orgId}`);
        this.log();
        this.logSuccess('Just to let you know...');
        this.log('Using **Org Check** in this Salesforce organization **will** increase its **API Request limit**.');
        this.log('The number of requests it will make to your org  really depends on how much metadata you have.');
        this.log();
        this.logSuccess('What is Salesforce saying about this limit?');
        this.log('If your org reaches or exceeds its daily API request limit, Salesforce still lets the operations');
        this.log(' proceed by a certain amount, if possible. It helps avoid blocking your workflows during unexpected');
        this.log(' spikes in workloads and occasional peak periods. A hard cap is in place to safeguard platform ');
        this.log(' resources and prevent API requests from exceeding the daily limit unimpeded.');
        this.log();
        this.logSuccess('How do we manage this limit in Org Check?');
        this.log('**Org Check** is monitoring the **API Request limit** of your org every time it uses the Salesforce');
        this.log(' APIs (and without any additional calls of course!). The usage of this limit will be shown in the');
        this.log(' application everytime. Additionally, the application will **warn** you when the limit starts ');
        this.log(' reaching **70%**, and, will **stop** working when the limit reaches **90%**.');
        this.log();
        this.logSuccess('Some last comments...');
        this.log('We strongly encourage you to use Org Check in a **dedicated Sandbox** which is not part of your');
        this.log(' Salesforce development lifecycle. We discourage you from using the application directly in your');
        this.log(' Production. Even if we put in place a control about this limit, we remind you that Salesforce ');
        this.log(' Labs applications (like Org Check) have no warranty of any sort (as described in our AppExchange');
        this.log(' listing');

        // Throw an error!
        throw new Error(`You need to accept the terms before (using the 'accept-the-terms' flag)`);
      }
    }

    // Start the spinner
    this.spinner.start('Org Check');

    // Set the output envelop here
    const output: CheckResult = {
      orgCheckVersion: orgcheckApi.version,
      salesforceOrgId: orgId,
      dateCheck: new Date().toISOString(),
      action: '',
      result: [],
    };

    // Recipe is set by implementation classes
    const recipe = this.getRecipe();

    if (recipe === undefined) {
      // if (the returned recipe is undefined) then 
      //   the implementation class needs to implement method doSpecialThingWithApi
      
      this.spinner.status = 'Running a dedicated action here...';
      output.action = await this.doSpecialThingWithApi(orgcheckApi);
      output.result = [];
    
    } else {
      // else just call the generic receipe from API

      if (flags['invalidate-cache']) {
        this.spinner.status = 'Running cache invalitation...';
        orgcheckApi.cleanData(
          recipe,
          flags['package'] ?? '',
          flags['sobject-type'] ?? '',
          flags['sobject'] ?? ''
        );
      }

      this.spinner.status = 'Running data preparation...';
      const mixture = await orgcheckApi.prepareData(
        recipe,
        flags['package'] ?? '',
        flags['sobject-type'] ?? '',
        flags['sobject'] ?? ''
      );
      
      output.action = recipe;
      output.result = mixture;
    }

    const isJsonFileSpecified = flags['json-file'] !== undefined;
    const isXlsxFileSpecified = flags['xlsx-file'] !== undefined;
    const isCsvFileSpecified  = flags['csv-file'] !== undefined;
    const isNoFileSpecified = !isJsonFileSpecified && !isXlsxFileSpecified && !isCsvFileSpecified;

    // Here we are asked to output the JSON into a file
    if (isJsonFileSpecified) {
      const jsonFilename = flags['json-file'];
      try {
        // Export JSON file
        createFile(jsonFilename, JSON.stringify(output, (key, value) => { if (key.endsWith('Refs')) return undefined; return value; }, 2));
        // Log the success
        this.logSuccess(`File ${jsonFilename} created successfully with JSON format.`);
      } catch (error) {
        // Log the error if any
        this.logToStderr(`File ${jsonFilename} not created due to the following error: ${error}`)
      }
    }

    // IF: 
    // - you asked for a XLSX or CSV export and recipe is defined, we need to get the plate and the doggyBag to generate te files (JSON export does not need them)
    // - you asked for no file export at all and did not specified the '--json' flag, then we also need to get the plate and doggybag to output something in the console
    if (recipe !== undefined && (isXlsxFileSpecified || isCsvFileSpecified || (isNoFileSpecified && this.jsonEnabled() === false))) {

      this.spinner.status = 'Running data service...';
      const plate = await orgcheckApi.serveData(recipe, output.result);

      this.spinner.status = 'Running data exporting...';
      const doggyBag = await orgcheckApi.exportData(recipe, plate);

      if (isXlsxFileSpecified) {
        const xlsxFilename = flags['xlsx-file'];
        try {
          // Export XLSX file
          createFile(xlsxFilename, Buffer.from(orgcheck.TableUtils.exportAsXls(doggyBag)));
          // Log the success
          this.logSuccess(`File ${xlsxFilename} created successfully with XLSX format.`);
        } catch (error) {
          // Log the error if any
          this.logToStderr(`File ${xlsxFilename} not created due to the following error: ${error}`)
        }
      }

      if (isCsvFileSpecified) {
        const csvFilename = flags['csv-file'];
        try {
          // create the file with empty content at first
          createEmptyFile(csvFilename);
          const exportedTables = Array.isArray(doggyBag) ? doggyBag : [doggyBag];
          exportedTables.forEach((exportedTable) => {
            // Write the Table name first (note the a flag to append the content!)
            appendLineInFile(csvFilename, `Table: ${exportedTable.label}`);
            appendLineInFile(csvFilename, '');
            // Write the columns headers
            appendLineInFile(csvFilename, csvJoiner(exportedTable.columns));
            // Write the rows
            exportedTable.rows.forEach((row) => {
              appendLineInFile(csvFilename, csvJoiner(row));
            });
            // Write a new line
            appendLineInFile(csvFilename, '')
          });
          // Log the success
          this.logSuccess(`File ${csvFilename} created successfully with CSV format.`);
        } catch (error) {
          // Log the error if any
          this.logToStderr(`File ${csvFilename} not created due to the following error: ${error}`)
        }
      }

      if (isNoFileSpecified && this.jsonEnabled() === false) {
        this.showResultsInConsole(output.result, plate);
        this.log();
        this.log('---');
        this.log(`For more information, you can export the data as CSV, XLSX or JSON format from the command line. See help.`);
      }
    }

    this.spinner.stop();

    return output;
  }
}

const createFile = (filename: string, content: string | Buffer) => {
  writeFileSync(filename, content, { flag: 'w' });
}

const createEmptyFile = (filename: string) => {
  writeFileSync(filename, '', { flag: 'w' });
}

const appendLineInFile = (filename: string, line: string) => {
  writeFileSync(filename, `${line}\n`, { flag: 'a' });
}

const csvJoiner = (row: string[]): string => {
  return `"${row.map((value) => value.replaceAll('"', '""')).join('","')}"`;
}