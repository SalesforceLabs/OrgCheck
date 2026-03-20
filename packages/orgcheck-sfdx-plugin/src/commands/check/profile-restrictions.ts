import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { SfdcProfileRestrictions } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckProfileRestrictions extends SfCommand<OrgCheckSfPluginOutput<SfdcProfileRestrictions[]>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.profile-restrictions.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.profile-restrictions.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.profile-restrictions.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean(),
    'package': Flags.string({ 
      char: 'p',
      summary: OrgCheckSfPluginMessages.getMessage('flags.package.summary')
    })
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcProfileRestrictions[]>> {
  
    const { flags } = await this.parse(CheckProfileRestrictions);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getProfileRestrictions(flags.package)) ?? [];
    return OrgCheckSfPluginGenerateOutput('profile-restrictions', orgcheckApi, results);
  }
}