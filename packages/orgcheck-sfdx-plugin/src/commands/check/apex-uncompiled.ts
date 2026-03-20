import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { SfdcApexClass } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckApexUncompiled extends SfCommand<OrgCheckSfPluginOutput<SfdcApexClass[]>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.apex-uncompiled.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.apex-uncompiled.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.apex-uncompiled.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckSfPluginMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcApexClass[]>> {
  
    const { flags } = await this.parse(CheckApexUncompiled);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getApexUncompiled(flags.package)) ?? [];
    return OrgCheckSfPluginGenerateOutput('apex-uncompiled', orgcheckApi, results);
  }
}