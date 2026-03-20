import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Connection } from '@salesforce/core';
import { SfdcUser } from '@orgcheck/api';
import orgcheck from '@orgcheck/api';
import { OrgCheckSfPluginOutput, OrgCheckSfPluginGenerateOutput } from '../../orgcheck-sfplugin/orgcheck-sfplugin-check-output.js';
import { OrgCheckSfPluginMessages } from '../../orgcheck-sfplugin/orgcheck-sfplugin-messages.js';
import { OrgCheckSfPluginLoadThirdParties } from '../../orgcheck-sfplugin/orgcheck-sfplugin-thirdparties.js';
import { OrgCheckSfPluginLoggerSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-logger-setup.js';
import { OrgCheckSfPluginStorageSetup } from '../../orgcheck-sfplugin/orgcheck-sfplugin-storage-setup.js';

OrgCheckSfPluginLoadThirdParties();

export default class CheckInternalActiveUsers extends SfCommand<OrgCheckSfPluginOutput<SfdcUser[]>> {
  
  public static readonly summary = OrgCheckSfPluginMessages.getMessage('check.internal-active-users.summary');
  public static readonly description = OrgCheckSfPluginMessages.getMessage('check.internal-active-users.description');
  public static readonly examples = OrgCheckSfPluginMessages.getMessages('check.internal-active-users.examples');
  
  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'verbose': Flags.boolean()
  }

  public async run(): Promise<OrgCheckSfPluginOutput<SfdcUser[]>> {
  
    const { flags } = await this.parse(CheckInternalActiveUsers);
    const connection: Connection = flags['target-org'].getConnection(undefined);
    const storageSetup: OrgCheckSfPluginStorageSetup = new OrgCheckSfPluginStorageSetup();
    const loggerSetup: OrgCheckSfPluginLoggerSetup = new OrgCheckSfPluginLoggerSetup(this.spinner, flags['verbose'])
    const orgcheckApi = orgcheck.ApiFactory.create({ 
      salesforce: { connection }, 
      storage: storageSetup, 
      logSettings: loggerSetup 
    });
    const results = (await orgcheckApi.getActiveUsers()) ?? [];
    return OrgCheckSfPluginGenerateOutput('internal-active-users', orgcheckApi, results);
  }
}